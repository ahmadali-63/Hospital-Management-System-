export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">Patient Registration</h2>
        <form className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Form fields here */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
