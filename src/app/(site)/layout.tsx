import { CartDrawer } from "@/components/site/CartDrawer";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <Header user={user} />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
