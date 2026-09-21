'use client';
// Static local SVGs have fixed dimensions and need no image optimizer.
/* oxlint-disable next/no-img-element */
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star } from './icons';
export function ListingCard({
  title,
  location,
  price,
  dates,
  rating,
  scene,
  tag,
  saved,
  onSavedChange,
}: {
  title: string;
  location: string;
  price: string;
  dates: string;
  rating: string;
  scene: string;
  tag: string;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
}) {
  return (
    <article className="tree-listing-card">
      <div className="tree-listing-media">
        <img
          src={`/illustrations/stay-${scene}.svg`}
          alt=""
          width={480}
          height={360}
        />
        {tag && <Badge variant="secondary">{tag}</Badge>}
        <Button
          className="tree-listing-save"
          size="icon-sm"
          variant="outline"
          aria-label={`${saved ? 'Unsave' : 'Save'} ${title}`}
          aria-pressed={saved}
          onClick={() => onSavedChange(!saved)}
        >
          <Star size={16} fill={saved ? 'currentColor' : 'none'} />
        </Button>
      </div>
      <div className="tree-listing-title">
        <h3>{title}</h3>
        <span>★ {rating}</span>
      </div>
      <p>{location}</p>
      <p>{dates}</p>
      <div className="tree-listing-price">
        {price}
        <span> / night</span>
      </div>
    </article>
  );
}
