interface MainProps {
  children?: React.ReactNode;
}

export default function Main({ children }: MainProps) {
  return (
    <div className="container">
      <main id="content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
