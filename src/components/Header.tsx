export default function Header() {
  return (
        <header className="mb-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Kampi Car Shop</h1>
            </div>
            <div>
                <button className="text-gray-300 hover:text-white">⚙️</button>
            </div>
            </div>
        </header>
    )
}