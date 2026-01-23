export const FormLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
};
