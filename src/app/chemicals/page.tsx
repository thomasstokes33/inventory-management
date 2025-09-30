import prisma from "@/lib/prisma";
import ChemicalsTable from "./components/chemicalsTable";
import CreateChemical from "./components/createChemical";
import { ChemicalRecord, chemicalSchema } from "@/schemas/chemical";

export default async function ChemicalDashboard() {
    const initialRawChems = await prisma.chemical.findMany({
        include: {hazardClass: true
        }, where: {status: {not: "ARCHIVED"}} 
    });
    const hazardClasses = await prisma.hazardClass.findMany();
    const initialChems : ChemicalRecord[] = initialRawChems.map (chem => chemicalSchema.parse(chem));
    return (
        <div className="container-lg mt-5">
            <div className="row">
                <div className="col-md-4">
                    {/* Each column is a feature */}
                    <CreateChemical hazardClasses={hazardClasses}/>
                </div>
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            Chemicals
                        </div>
                        <div className="card-body">
                            <ChemicalsTable initialChems={initialChems}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}