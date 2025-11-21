export default function InputField({ label, type, onChange }) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        onChange={onChange}
        placeholder=" "
        className="peer w-full p-4 border text-gray-900 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition bg-white/70 backdrop-blur"
      />
      <label className="absolute left-4 top-4 peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-blue-600 text-gray-700 text-sm transition-all bg-white px-1">
        {label}
      </label>
    </div>
  );
}
