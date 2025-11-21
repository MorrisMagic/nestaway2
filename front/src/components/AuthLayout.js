export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background gradient circles */}
      <div className="absolute w-[550px] h-[550px] bg-blue-300/30 rounded-full blur-3xl top-[-100px] left-[-120px]"></div>
      <div className="absolute w-[450px] h-[450px] bg-yellow-200/30 rounded-full blur-3xl bottom-[-80px] right-[-80px]"></div>

      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md animate-fade-in">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">NA</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 text-center">{title}</h1>
        <p className="text-gray-500 text-center mt-2">{subtitle}</p>

        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
