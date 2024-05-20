import dynamic from "next/dynamic";
const CaveSurveyDataView = dynamic(
  () => import("@/components/CaveSurveyDataView"),
  { ssr: false }
);

export default function Home() {
  return <CaveSurveyDataView />;
}
