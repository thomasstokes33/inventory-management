
import prisma from "@/lib/prisma";
import StockCreation from "./components/StockCreation";
import { LocationRecord, locationSchema } from "@/schemas/location";
import StockDeletion from "./components/StockDeletion";
import { stockSchema } from "@/schemas/stock";
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
    return (<div className="container-lg mt-5">
        <div className="row">
            <div className="col-md-6">
                <StockCreation locations={locations}/>
                <StockDeletion stock={stocks}/>
            </div>
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">Goods issue/receipt</div>
                    <div className="card-body">
                        <form>
                            <label>stock</label>
                            <input className="form-control"></input>
                            <label>quantity</label>
                            <input className="form-control"></input>
                            <label>movement type</label>
                            <input className="form-control"></input>
                            <label>amount</label>
                            <input className="form-control"></input>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    </div>);
}