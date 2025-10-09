"use client";

export default function IssueReceipt({ }) {
    const handleGoodsIssueReceipt = async () => {
    };
    return (<div className="container-lg mt-5">
        <div className="row">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">Setup location</div>
                    <div className="card-body">
                        <form>
                            <label>chemical</label>
                            <input className="form-control"></input>
                            <label>location</label>
                            <input className="form-control"></input>
                        </form>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">Goods Issue/Receipt</div>
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