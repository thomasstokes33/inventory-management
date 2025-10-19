
import prisma from "@/lib/prisma";
import StockCreation from "./components/StockCreation";
import { LocationRecord, locationSchema } from "@/schemas/location";
import StockDeletion from "./components/StockDeletion";
import { stockSchema } from "@/schemas/stock";
import StockMovementPanel from "./components/StockMovementPanel";
import { supplierSchema } from "@/schemas/supplier";
export  default async function IssueReceipt({ }) {
    const handleGoodsIssueReceipt = async () => {
    };
    const rawLocations = await prisma.location.findMany();
    const rawStock = await prisma.stock.findMany({ where: { archived: { equals: false } },
        include: {
            chemical: {include: {hazardClass: true}},
            location: true
        }
    });
    const stocks = rawStock.map((stock) => stockSchema.parse(stock));
    const locations : LocationRecord[] = rawLocations.map((loc) => locationSchema.parse(loc));
    const rawSuppliers = await prisma.supplier.findMany();
    const suppliers = rawSuppliers.map(sup => supplierSchema.parse(sup));
    return (<div className="container-lg mt-5">
        <div className="row">
            <div className="col-md-6">
                <StockCreation locations={locations}/>
                <StockDeletion stock={stocks}/>
            </div>
            <div className="col-md-6">
                <StockMovementPanel suppliers={suppliers} stockCount={stocks.length}/>
            </div>
        </div>
    </div>);
}