export default function Footer() {
  return (
    <footer className="bg-[#f7f7f7] mt-20 py-10 border-t">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-xl font-semibold text-gray-800">
          山口みかん農園
        </h3>

        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
          福岡県みやま市瀬高町上庄 63-11
        </p>

        <div className="mt-4 space-y-1 text-sm text-gray-600 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-700">氏名：</span>
            山口みかん農園
          </p>

          <p>
            <span className="font-semibold text-gray-700">TEL：</span>
            <a href="tel:08015439704" className="underline">
              080-1543-9704
            </a>
          </p>

          <p>
            <span className="font-semibold text-gray-700">メール：</span>
            <a
              href="mailto:yamaguchinouen0915@gmail.com"
              className="underline break-all"
            >
              yamaguchinouen0915@gmail.com
            </a>
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed">
          代金引換をご利用いただく際に必要となる販売者情報です。
        </div>

        <div className="mt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} 山口みかん農園. All rights reserved.
        </div>
      </div>
    </footer>
  );
}