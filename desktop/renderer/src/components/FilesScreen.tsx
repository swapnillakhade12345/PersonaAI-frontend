import { useEffect, useRef, useState } from "react"
import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"
import { listDocuments, uploadDocument } from "../services/api"

interface SavedFile {
  id: string
  name: string
  storedName: string
  size: number
  type: string
  path: string
  uploadedAt: string
  indexed?: boolean
  indexingError?: string
  remote?: boolean
}

interface FilesScreenProps {
  onNavigate: (item: PersonaSidebarItem) => void
  onOpenSettings: () => void
}

function FilesScreen({
  onNavigate,
  onOpenSettings,
}: FilesScreenProps) {
  const [files, setFiles] = useState<SavedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved files
  useEffect(() => {
    const loadFiles = async () => {
      let savedFiles: SavedFile[] = []
      try {
        if (window.electronAPI?.isElectron) {
          savedFiles = await window.electronAPI.getFiles()
        }
      } catch (error) {
        console.error("Could not load files:", error)
      }

      try {
        const documents = await listDocuments()
        const savedNames = new Set(savedFiles.map((file) => file.name))
        const remoteFiles: SavedFile[] = documents
          .filter((document) => !savedNames.has(document.name))
          .map((document) => ({
            id: document.id,
            name: document.name,
            storedName: document.name,
            size: 0,
            type: "Indexed document",
            path: "",
            uploadedAt: document.createdAt,
            indexed: true,
            remote: true,
          }))
        setFiles([...savedFiles, ...remoteFiles])
      } catch (error) {
        setFiles(savedFiles)
        setServiceError(error instanceof Error ? error.message : "Could not load indexed documents.")
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [])

  // Choose file
  const handleChooseFile = async () => {
    if (!window.electronAPI?.isElectron) {
      fileInputRef.current?.click()
      return
    }

    try {
      const newFiles = await window.electronAPI.selectFiles()

      if (newFiles.length > 0) {
        setFiles((previousFiles) => [...previousFiles, ...newFiles])
      }
    } catch (error) {
      console.error("File selection error:", error)
    }
  }

  // Browser file selection
  const handleBrowserFiles = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length > 0) {
      const localFiles = selectedFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        storedName: file.name,
        size: file.size,
        type: file.type || "File",
        path: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }))
      setFiles((previousFiles) => [...previousFiles, ...localFiles])

      await Promise.all(selectedFiles.map(async (file, index) => {
        const localFile = localFiles[index]
        try {
          const document = await uploadDocument(file)
          setFiles((previousFiles) => previousFiles.map((item) =>
            item.id === localFile.id
              ? { ...item, id: document.id, indexed: true }
              : item
          ))
        } catch (error) {
          setFiles((previousFiles) => previousFiles.map((item) =>
            item.id === localFile.id
              ? { ...item, indexingError: error instanceof Error ? error.message : "Upload failed." }
              : item
          ))
        }
      }))
    }

    event.target.value = ""
  }

  // Remove file
  const handleRemoveFile = async (id: string) => {
    if (files.find((file) => file.id === id)?.remote) {
      return
    }

    if (!window.electronAPI?.isElectron) {
      setFiles((previousFiles) => {
        const file = previousFiles.find((item) => item.id === id)

        if (file?.path.startsWith("blob:")) {
          URL.revokeObjectURL(file.path)
        }

        return previousFiles.filter((item) => item.id !== id)
      })

      return
    }

    try {
      const deleted = await window.electronAPI.deleteFile(id)

      if (deleted) {
        setFiles((previousFiles) =>
          previousFiles.filter((file) => file.id !== id)
        )
      }
    } catch (error) {
      console.error("Could not delete file:", error)
    }
  }

  // Open file
  const handleOpenFile = async (id: string) => {
    if (!files.find((file) => file.id === id)?.path) {
      return
    }

    if (!window.electronAPI?.isElectron) {
      const file = files.find((item) => item.id === id)

      if (file) {
        window.open(file.path, "_blank", "noopener,noreferrer")
      }

      return
    }

    try {
      await window.electronAPI.openFile(id)
    } catch (error) {
      console.error("Could not open file:", error)
    }
  }

  // Format size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  // File icon
  const getFileIcon = (type: string, name: string) => {
    const extension = name.split(".").pop()?.toLowerCase()

    if (
      type.includes("image") ||
      ["png", "jpg", "jpeg", "webp"].includes(extension || "")
    ) {
      return "🖼️"
    }

    if (
      type.includes("pdf") ||
      extension === "pdf"
    ) {
      return "📕"
    }

    if (
      type.includes("word") ||
      ["doc", "docx"].includes(extension || "")
    ) {
      return "📘"
    }

    if (
      type.includes("sheet") ||
      ["xls", "xlsx", "csv"].includes(extension || "")
    ) {
      return "📊"
    }

    if (
      type.includes("text") ||
      extension === "txt"
    ) {
      return "📝"
    }

    return "📄"
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080D1B] text-white">
      <WorkspaceLayout
        activeItem="files"
        onOpenSettings={onOpenSettings}
        onNavigate={onNavigate}
      >

      {/* Main Content (width from Code 2) */}
      <section className="relative min-h-screen flex-1 p-8">

        {/* Header */}
        <header className="flex items-start justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              PERSONAL WORKSPACE
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Your Files
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Manage your personal files and documents in one place.
            </p>
          </div>

          {/* File Count */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-right backdrop-blur-xl">
            <p className="text-xs text-gray-500">
              TOTAL FILES
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {files.length}
            </p>
          </div>

        </header>

        {/* Upload Area */}
        <div className="group relative mt-8 overflow-hidden rounded-3xl border border-dashed border-[#263449] bg-[#111827] p-12 text-center shadow-[0_18px_30px_rgba(15,23,42,0.18)] transition-all duration-300 hover:border-sky-400/30">

          {/* Upload Glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">

            {/* Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/15 to-purple-500/10 text-4xl shadow-[0_0_35px_rgba(59,130,246,0.12)] transition-transform duration-300 group-hover:-translate-y-1">
              ↑
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              Upload your files
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Select documents, images or other files from your computer.
            </p>

            <button
              type="button"
              onClick={handleChooseFile}
              className="mt-7 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold shadow-[0_8px_25px_rgba(59,130,246,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(59,130,246,0.3)] active:translate-y-0"
            >
              + Choose File
            </button>

            <p className="mt-4 text-[11px] text-gray-600">
              Multiple files supported
            </p>

            {serviceError && (
              <p role="alert" className="mt-3 text-sm text-amber-300">
                Document service unavailable: {serviceError}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleBrowserFiles}
            />

          </div>
        </div>

        {/* File Section */}
        {loading ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#10182B] p-10 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400" />

            <p className="mt-4 text-sm text-gray-500">
              Loading files...
            </p>

          </div>
        ) : files.length > 0 ? (
          <div className="mt-8">

            {/* Section Header */}
            <div className="mb-4 flex items-center justify-between">

              <div>
                <h3 className="text-lg font-semibold">
                  Uploaded Files
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Your recently added documents
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>

            </div>

            {/* File Cards */}
            <div className="space-y-3">

              {files.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center justify-between rounded-2xl border border-[#263449] bg-[#111827] p-4 backdrop-blur-xl transition-all duration-200 hover:border-sky-400/20 hover:bg-[#162033] hover:shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
                >

                  {/* File Info */}
                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-xl">
                      {getFileIcon(file.type, file.name)}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-gray-200">
                        {file.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">

                        <span>
                          {formatFileSize(file.size)}
                        </span>

                        <span className="text-gray-700">
                          •
                        </span>

                        <span className="max-w-48 truncate">
                          {file.type || "File"}
                        </span>

                        <span title={file.indexingError} className={file.indexed || file.remote ? "text-emerald-400" : file.indexingError ? "text-amber-300" : "text-gray-500"}>
                          {file.indexed ? "Uploaded" : file.indexingError ? "Upload failed" : file.remote ? "On AI service" : "Saved locally"}
                        </span>

                      </div>

                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="ml-4 flex shrink-0 gap-2">

                    <button
                      type="button"
                      onClick={() => handleOpenFile(file.id)}
                      disabled={!file.path}
                      className="rounded-xl border border-blue-400/10 bg-blue-500/5 px-4 py-2 text-sm text-blue-400 transition-all duration-200 hover:bg-blue-500/15 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={file.remote}
                      className="rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-2 text-sm text-red-400 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              ))}

            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#10182B]/80 p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] text-2xl">
              📁
            </div>

            <h3 className="mt-5 font-semibold text-gray-300">
              No files yet
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Upload your first file to see it here.
            </p>

          </div>
        )}

      </section>
      </WorkspaceLayout>
    </main>
  )
}
export default FilesScreen