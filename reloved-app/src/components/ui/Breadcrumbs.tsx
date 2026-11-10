import { Fragment } from "react";
import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  to?: string;
}

function BreadCrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Brödsmulor">
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <span>/</span>}
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export default BreadCrumbs;
