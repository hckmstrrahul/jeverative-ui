'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
export function FeedItem({
  author,
  handle,
  body,
  time,
}: {
  author: string;
  handle: string;
  body: string;
  time: string;
}) {
  const [liked, setLiked] = useState(false),
    [saved, setSaved] = useState(false);
  return (
    <article className="social-post">
      <div className="social-author">
        <Avatar>
          <AvatarFallback>
            {author
              .split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <strong>{author}</strong>
          <p>
            {handle} · {time}
          </p>
        </div>
      </div>
      <p className="social-body">{body}</p>
      <div className="social-actions">
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
        >
          {liked ? 'Liked' : 'Like'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </article>
  );
}
export function PostComposer({
  label,
  author,
  placeholder,
}: {
  label: string;
  author: string;
  placeholder: string;
}) {
  const [draft, setDraft] = useState(''),
    [posts, setPosts] = useState<string[]>([]);
  return (
    <section className="social-composer">
      <label className="social-compose-label">
        {label}
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
        />
      </label>
      <div className="social-compose-footer">
        <span>{draft.length}/500 · local preview</span>
        <Button
          size="sm"
          disabled={!draft.trim()}
          onClick={() => {
            setPosts((p) => [draft.trim(), ...p].slice(0, 20));
            setDraft('');
          }}
        >
          Post
        </Button>
      </div>
      <div aria-live="polite">
        {posts.map((body, i) => (
          <FeedItem
            key={`${i}-${body}`}
            author={author}
            handle="You"
            body={body}
            time="Just now"
          />
        ))}
      </div>
    </section>
  );
}
export function InboxPane({ title }: { title: string }) {
  const [thread, setThread] = useState('Maya'),
    [draft, setDraft] = useState('');
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  return (
    <section className="social-inbox">
      <h2>{title}</h2>
      <div className="social-thread-tabs" aria-label="Conversations">
        {['Maya', 'Aarav'].map((name) => (
          <Button
            key={name}
            size="sm"
            variant={thread === name ? 'secondary' : 'ghost'}
            aria-pressed={thread === name}
            onClick={() => {
              setThread(name);
              setDraft('');
            }}
          >
            {name}
          </Button>
        ))}
      </div>
      <div className="social-messages" aria-live="polite">
        <p>
          <strong>{thread}</strong>
          <br />
          {thread === 'Maya'
            ? 'Loved your latest design. Want to share notes?'
            : 'Are you joining the community meetup?'}
        </p>
        {(replies[thread] ?? []).map((text, i) => (
          <p key={i} className="social-sent">
            <strong>You</strong>
            <br />
            {text}
          </p>
        ))}
      </div>
      <label>
        Reply to {thread}
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a reply…"
          maxLength={500}
        />
      </label>
      <Button
        size="sm"
        disabled={!draft.trim()}
        onClick={() => {
          setReplies((old) => ({
            ...old,
            [thread]: [...(old[thread] ?? []), draft.trim()].slice(-20),
          }));
          setDraft('');
        }}
      >
        Send locally
      </Button>
    </section>
  );
}
