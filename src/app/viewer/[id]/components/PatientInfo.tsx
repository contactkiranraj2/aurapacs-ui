import { extractPatientName, getDicomValue } from "../lib/utils";

interface PatientInfoProps {
  patientInfo: Record<string, any> | null;
}

const PatientInfo = ({ patientInfo }: PatientInfoProps) => {
  if (!patientInfo) {
    return null;
  }

  return (
    <div className="text-sm text-right text-cyan-200/80">
      <p>
        <strong className="font-semibold text-white">Patient:</strong>{" "}
        {extractPatientName(getDicomValue(patientInfo, "00100010"))}
      </p>
      <p>
        <strong className="font-semibold text-white">Study:</strong>{" "}
        {getDicomValue(patientInfo, "00081030") || "N/A"}
      </p>
    </div>
  );
};

export default PatientInfo;
