import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { ComponentType, MouseEventHandler } from "react";

type HideBelowOptions = "sm" | "md" | "lg" | "xl"
type TableColumn<T, K = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
    formatEditable?: (value: T, onChangeHandler: (value: string) => void) => React.ReactNode;
    hideBelow?: HideBelowOptions;
};


function getCellClass(hideBelow?: HideBelowOptions) {
    if (!hideBelow) return "";
    return `d-none d-${hideBelow}-table-cell`;
}


type TableProps<I> = { tableColumns: TableColumn<I>[], items: I[], RowComponent: ComponentType<{ item: I, router: AppRouterInstance }> }
export default function Table<T extends {id: number}>({ tableColumns, items, RowComponent }: TableProps<T>) {
    const router = useRouter();
    return (
        <div className="table-responsive">
            <table className="table">
                <thead className="table-dark">
                    <tr>
                        {tableColumns.map((col) => {
                            return <td key={col.label} className={getCellClass(col.hideBelow)}>{col.label}</td>;
                        })}
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: T) => {
                        return <RowComponent key={item.id} router={router}  item={item} />;
                    
                    })}
                </tbody>
            </table>
        </div>
    );
}

export type RowAction = { showWhenEditing: boolean, showWhenNotEditing: boolean, label: string, isPrimary: boolean, actionHandler?: MouseEventHandler<HTMLButtonElement>, hiddenClass?: HideBelowOptions }
type RowProps<T, K extends keyof T = keyof T> = { item: T, isEditing: boolean, tableColumns: TableColumn<T>[], onChange: (field: K, value: string) => void, actions: RowAction[] }
export function Row<T>({ item, tableColumns, isEditing, onChange, actions }: RowProps<T>) {

    return (<tr>
        {tableColumns.map(({ field, format, formatEditable, hideBelow }, index) => (
            <td className={getCellClass(hideBelow)} key={index}>
                {isEditing && formatEditable
                    ? formatEditable(item, (value) => onChange(field, value))
                    : format
                        ? format(item)
                        : item[field]?.toString()
                }
            </td>
        ))}
        <td>
            {actions.map((action, index) => {
                if (isEditing && !action.showWhenEditing) return null;
                if (!isEditing && !action.showWhenNotEditing) return null;
                let btnClass = action.isPrimary ? "btn-outline-primary" : "btn-outline-secondary";
                if (action.hiddenClass) {
                    btnClass = `${btnClass} ${getCellClass(action.hiddenClass)}`;
                }
                return <button onClick={action.actionHandler} className={`btn ${btnClass}`} key={index}>{action.label}</button>;
            })}
        </td>

    </tr>);
}