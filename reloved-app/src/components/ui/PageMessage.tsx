// En sida med ett meddelande
function PageMessage({ children }: { children: string }) {
  return (
    <main>
      <p>{children}</p>
    </main>
  );
}

export default PageMessage;
