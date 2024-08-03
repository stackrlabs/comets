interface Props {
  children: React.ReactNode;
  onClick: () => void;
}

export const Button: React.FC<Props> = ({ children, onClick }) => {
  return (
    <button
      className="select-none p-2 px-4 border-2 cursor-pointer shadow-sm hover:bg-gray-800 hover:border-gray-400"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
