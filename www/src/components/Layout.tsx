import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="container mx-auto max-w-5xl">
      <Header />
      <main>{children}</main>
    </div>
  );
}
