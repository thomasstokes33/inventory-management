
type CountCardProps = {
    title: string,
    count: number
}
export default function CountCard({title, count}: CountCardProps) {
    return (
        <div className="card h-100">
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{count}</p>
            </div>
        </div>
    );
}