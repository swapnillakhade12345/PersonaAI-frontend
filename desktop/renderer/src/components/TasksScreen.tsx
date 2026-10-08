import { useEffect, useState } from "react"
import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"

interface TasksScreenProps {
  onNavigate: (item: PersonaSidebarItem) => void
  onOpenSettings: () => void
}

function TasksScreen({
  onNavigate,
  onOpenSettings,
}: TasksScreenProps) {
  const [task, setTask] = useState("")

  const [tasks, setTasks] = useState<string[]>(() => {
    const savedTasks = localStorage.getItem("personaAI_tasks")

    if (savedTasks) {
      try {
        return JSON.parse(savedTasks)
      } catch {
        return []
      }
    }

    return []
  })

  // Save tasks whenever tasks change
  useEffect(() => {
    localStorage.setItem("personaAI_tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (task.trim() === "") return

    setTasks((previousTasks) => [
      ...previousTasks,
      task.trim(),
    ])

    setTask("")
  }

  const deleteTask = (index: number) => {
    setTasks((previousTasks) =>
      previousTasks.filter((_, i) => i !== index)
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080D1B] text-white">
      <WorkspaceLayout
        activeItem="tasks"
        onOpenSettings={onOpenSettings}
        onNavigate={onNavigate}
      >

      {/* Main Content (width + min-w-0 from Code 2) */}
      <section className="relative min-h-screen flex-1 min-w-0 p-8">

        {/* Header */}
        <header className="flex items-start justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-xs text-purple-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

              PRODUCTIVITY
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Tasks
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Organize and manage your daily tasks.
            </p>

          </div>

          {/* Task Count */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-right backdrop-blur-xl">

            <p className="text-xs text-gray-500">
              TOTAL TASKS
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {tasks.length}
            </p>

          </div>

        </header>

        {/* Create Task */}
        <div className="group relative mt-8 overflow-hidden rounded-3xl border border-[#263449] bg-[#111827] p-7 shadow-[0_18px_30px_rgba(15,23,42,0.18)]">

          {/* Glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
                +
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Create a task
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Add something you want to accomplish.
                </p>
              </div>

            </div>

            <div className="mt-6 flex gap-3">

              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask()
                  }
                }}
                placeholder="Enter a new task..."
                className="min-w-0 flex-1 rounded-xl border border-[#263449] bg-[#0F172A] px-4 py-3 text-sm text-slate-50 outline-none transition-all placeholder:text-slate-500 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/10"
              />

              <button
                type="button"
                onClick={addTask}
                className="rounded-xl bg-[#2563EB] px-7 text-sm font-semibold shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition-all duration-200 hover:bg-[#1D4ED8] active:translate-y-0"
              >
                Add Task
              </button>

            </div>

          </div>

        </div>

        {/* Task List */}
        <div className="mt-8">

          {tasks.length === 0 ? (

            /* Empty State */
            <div className="rounded-3xl border border-white/10 bg-[#10182B]/80 p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
                ✓
              </div>

              <h3 className="mt-5 font-semibold text-gray-300">
                No tasks yet
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Create your first task above.
              </p>

            </div>

          ) : (

            <div>

              {/* Section Header */}
              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-semibold">
                    Your Tasks
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Keep track of what you need to accomplish.
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </span>

              </div>

              {/* Task Cards */}
              <div className="space-y-3">

                {tasks.map((item, index) => (

                  <div
                    key={`${item}-${index}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[#263449] bg-[#111827] p-4 backdrop-blur-xl transition-all duration-200 hover:border-sky-400/20 hover:bg-[#162033] hover:shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
                  >

                    {/* Task Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-lg text-blue-400 transition-transform duration-200 group-hover:scale-105">
                      ✓
                    </div>

                    {/* Task Text */}
                    <div className="min-w-0 flex-1">

                      <p className="break-words text-sm font-medium text-gray-200">
                        {item}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-600">
                        Pending task
                      </p>

                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => deleteTask(index)}
                      className="shrink-0 rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-2 text-sm text-red-400 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300"
                    >
                      Delete
                    </button>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

      </section>
      </WorkspaceLayout>
    </main>
  )
}

export default TasksScreen