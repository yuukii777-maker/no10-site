export default function Footer() {
  return (
    <footer className="bg-[#f7f7f7] mt-20 py-10 border-t">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-xl font-semibold text-gray-800">山川みかん農園</h3>

        <p className="text-gray-600 text-sm mt-2">
          福岡県みやま市山川町 — こだわりのみかんを育てています。
        </p>

        <div className="mt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} 山川みかん農園. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
