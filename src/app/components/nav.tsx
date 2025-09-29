import Link from "next/link";

export default function Nav() {
    return (
        <nav className="navbar navbar-expand-sm">
            <div className="container-xxl">
                {/* container xxl centers. Auto centers */}
                <Link className="navbar-brand" href="/">Inventory App</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link className="nav-link" href="/chemicals">Chemicals</Link>
                        <Link className="nav-link" href="/issue-receipt">Goods Receipt/Item</Link>
                        <Link className="nav-link" href="/query">Query</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}