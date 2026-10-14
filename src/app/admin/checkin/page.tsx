import { CheckinScanner } from "@/components/admin/CheckinScanner";
import { PageHead } from "@/components/admin/ui";

export const metadata = { title: "Check-in" };

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <>
      <PageHead title="Check-in" sub="Escanea el QR del boleto en la entrada. La asistencia queda registrada al instante." />
      <CheckinScanner initialCode={code} />
    </>
  );
}
