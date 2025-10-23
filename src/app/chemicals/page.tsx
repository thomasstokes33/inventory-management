import prisma from "@/lib/prisma";
import ChemicalsTable from "./components/ChemicalsTable";
import CreateChemical from "./components/CreateChemical";
import { ChemicalRecordWithTotalStockAndSynonyms, chemicalSchemaWithTotalStockAndSynonyms } from "@/schemas/chemical";
export const revalidate = 0;

export default async function ChemicalDashboard() {
    const initialRawChems = await prisma.chemical.findMany({
        include: {hazardClass: true, synonyms: {select: {synonym: true}}, stock: {select: {stockQuantity: true}}},
        where: {status: {not: "ARCHIVED"}} 
    });
    const hazardClasses = await prisma.hazardClass.findMany();
    const initialRawChemsWithTotalQuantity = initialRawChems.map(chem => {return { ...chem, totalQuantity: chem.stock.reduce((accum, stock) => accum + stock.stockQuantity, 0) };});
    const initialChems : ChemicalRecordWithTotalStockAndSynonyms[] = initialRawChemsWithTotalQuantity.map(chem => chemicalSchemaWithTotalStockAndSynonyms.parse(chem));
    return (
        <div className="container-lg mt-5">
            <div className="row">
                <div className="col-lg-4">
                    {/* Each column is a feature */}
                    <CreateChemical hazardClasses={hazardClasses}/>
                </div>
                <div className="col-lg-8">
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