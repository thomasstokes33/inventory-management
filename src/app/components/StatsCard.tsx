
type statsProps<T> = {
    title: string,
    items: T[],
    renderItem: (item: T) => React.ReactNode
}
export default function StatsCard<T>({title,  items, renderItem }: statsProps<T>) {
    return (
        <div className="card mb-3">
            <div className="card-header">{title}</div>
            <div>
                <ul className="list-group list-group-flush">
                    {items.map((item, id) => (
                        <li key={id} className="list-group-item">{renderItem(item)}</li>
                    ))}
                </ul>
            </div>

        </div>
    );
}