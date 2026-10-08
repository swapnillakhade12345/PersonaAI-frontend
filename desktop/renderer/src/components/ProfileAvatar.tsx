interface ProfileAvatarProps {
  image: string | null
  name: string
  className: string
}

function ProfileAvatar({ image, name, className }: ProfileAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "U"

  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {image ? (
        <img
          src={image}
          alt={`${name || "User"} profile`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}

export default ProfileAvatar
