'use client';
import { useId, useState, type ReactNode } from 'react';
import type { Screen } from '@/lib/catalog';
import { getBlueprint } from '@/lib/ui-grammar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Bell,
  KeyRound,
  Grid,
  Mail,
  ChevronRight,
  Monitor,
  FileText,
  ArrowUpRight,
  Check,
} from '@/components/icons';
import { toast } from '@/components/ui/toast';

const notify = (title: string) => toast.add({ title, type: 'success' });
const people = {
  personal: {
    name: 'Alex Morgan',
    role: 'Curious by nature.',
    bio: 'Collecting ideas, discovering new places and making time for what matters.',
    stats: [
      ['Collections', '12'],
      ['Following', '84'],
      ['Connections', '128'],
    ],
    section: 'Your collections',
    items: [
      'Places to return to',
      'A slower weekend',
      'Things worth reading',
      'Everyday inspiration',
    ],
  },
  professional: {
    name: 'Alex Morgan',
    role: 'Product designer · Bengaluru',
    bio: 'Turning complex problems into useful, thoughtful products. Currently building tools for better everyday decisions.',
    stats: [
      ['Projects', '18'],
      ['Experience', '6 years'],
      ['Collaborators', '24'],
    ],
    section: 'Selected work',
    items: [
      'A clearer investment journey',
      'Designing for daily habits',
      'A shared component language',
      'Research into real routines',
    ],
  },
  creator: {
    name: 'Alex Morgan',
    role: 'Designer, writer & maker',
    bio: 'Notes on good design and the small details that make everyday life feel better.',
    stats: [
      ['Posts', '42'],
      ['Followers', '2.4k'],
      ['Collections', '12'],
    ],
    section: 'Recent stories',
    items: [
      'Good design starts with noticing',
      'Small details, lasting impact',
      'A field guide to creative work',
      'Making room for new ideas',
    ],
  },
  investor: {
    name: 'Alex Morgan',
    role: 'Long-term investor',
    bio: 'Building a disciplined portfolio, one thoughtful decision at a time.',
    stats: [
      ['Watchlists', '4'],
      ['Experience', '3 years'],
      ['Goals', '6'],
    ],
    section: 'Investing activity',
    items: [
      'Long-term wealth',
      'Companies I follow',
      'Monthly investing plan',
      'Learning about markets',
    ],
  },
} as const;
function Identity({ mode = 'personal' }: { mode?: Screen['contentMode'] }) {
  return (
    <div className="account-identity">
      <Avatar className="account-avatar">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <div>
        <strong>Alex Morgan</strong>
        <p>{people[mode ?? 'personal'].role}</p>
      </div>
    </div>
  );
}
export function ProfileHeader({ screen }: { screen: Screen }) {
  const person = people[screen.contentMode ?? 'personal'];
  const [name, setName] = useState<string>(person.name);
  const [bio, setBio] = useState<string>(person.bio);
  const [editing, setEditing] = useState(false);
  const [following, setFollowing] = useState(false);
  const id = useId();
  const kind = getBlueprint(screen).id.split(':')[1];
  return (
    <div className={`profile-hero profile-${kind}`}>
      {kind === 'cover' && (
        <div className="profile-cover" aria-hidden="true">
          <span>Make space for good ideas.</span>
          <Grid size={28} />
        </div>
      )}
      <div className="profile-hero-content">
        <Avatar className="profile-avatar">
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
        <div className="profile-intro">
          <p className="account-eyebrow">
            {screen.contentMode === 'investor'
              ? 'Investor profile'
              : 'Member profile'}
          </p>
          <h3>{name}</h3>
          <p>{person.role}</p>
          <p className="profile-bio">{bio}</p>
        </div>
        <div className="profile-actions">
          <Button onClick={() => setFollowing(!following)}>
            {following ? (
              <>
                <Check /> Following
              </>
            ) : (
              'Follow'
            )}
          </Button>
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit profile
          </Button>
        </div>
        <dl className="profile-stats">
          {person.stats.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Changes are saved in this preview.
          </DialogDescription>
          <form
            className="account-fields"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const nextName = data.get('name');
              if (typeof nextName === 'string') setName(nextName);
              const nextBio = data.get('bio');
              if (typeof nextBio === 'string') setBio(nextBio);
              setEditing(false);
              notify('Profile updated in preview');
            }}
          >
            <Label htmlFor={id + '-name'}>Display name</Label>
            <Input
              id={id + '-name'}
              name="name"
              defaultValue={name}
              required
              maxLength={80}
            />
            <Label htmlFor={id + '-bio'}>About you</Label>
            <Textarea
              id={id + '-bio'}
              name="bio"
              defaultValue={bio}
              maxLength={280}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function ProfileContent({ screen }: { screen: Screen }) {
  const person = people[screen.contentMode ?? 'personal'];
  const [tab, setTab] = useState('work');
  const [opened, setOpened] = useState<string | null>(null);
  const kind = getBlueprint(screen).id.split(':')[1];
  const options = [
    ['work', person.section],
    ['about', 'About'],
    ['activity', 'Activity'],
  ];
  return (
    <div className={`profile-content profile-content-${kind}`}>
      <fieldset className="account-segmented" aria-label="Profile content">
        {options.map(([value, label]) => (
          <Button
            variant="ghost"
            key={value}
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {label}
          </Button>
        ))}
      </fieldset>
      {tab === 'about' ? (
        <div className="profile-about">
          <h3>A little more about Alex</h3>
          <p>{person.bio}</p>
          <dl>
            <div>
              <dt>Based in</dt>
              <dd>Bengaluru, India</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>2023</dd>
            </div>
            <div>
              <dt>Interests</dt>
              <dd>
                {screen.contentMode === 'investor'
                  ? 'Markets, financial literacy, long-term growth'
                  : 'Design, technology, photography'}
              </dd>
            </div>
          </dl>
        </div>
      ) : tab === 'activity' ? (
        <div className="profile-timeline">
          {[
            'Shared a new collection',
            'Updated a project',
            'Joined a conversation',
          ].map((title, index) => (
            <button key={title} onClick={() => setOpened(title)}>
              <span className="timeline-dot" />
              <div>
                <strong>{title}</strong>
                <p>{index + 1} days ago · Public activity</p>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      ) : (
        <div className="profile-projects">
          {person.items
            .slice(0, screen.complexity === 'simple' ? 2 : 4)
            .map((title, index) => (
              <button
                className="profile-project"
                key={title}
                onClick={() => setOpened(title)}
              >
                <div className={`project-art art-${index}`} aria-hidden="true">
                  <span>0{index + 1}</span>
                  <FileText size={28} />
                </div>
                <div>
                  <p className="account-eyebrow">
                    {screen.contentMode === 'investor'
                      ? 'Collection'
                      : screen.contentMode === 'professional'
                        ? 'Case study'
                        : 'Journal'}
                  </p>
                  <h3>{title}</h3>
                  <p>
                    {index + 2} min read <span>·</span> Updated recently
                  </p>
                </div>
                <ArrowUpRight size={20} />
              </button>
            ))}
        </div>
      )}
      <Dialog
        open={opened !== null}
        onOpenChange={(open) => {
          if (!open) setOpened(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{opened}</DialogTitle>
          <DialogDescription>Sample profile content</DialogDescription>
          <p>{person.bio}</p>
          <p>
            This collection brings together notes, ideas and work in progress.
            Content in this playground is illustrative.
          </p>
          <Button variant="outline" onClick={() => setOpened(null)}>
            Back to profile
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Preference({
  title,
  description,
  initial = false,
}: {
  title: string;
  description: string;
  initial?: boolean;
}) {
  const id = useId();
  const [checked, setChecked] = useState(initial);
  return (
    <div className="account-preference">
      <div>
        <Label htmlFor={id}>{title}</Label>
        <p>{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}
function TextField({
  title,
  value,
  type = 'text',
}: {
  title: string;
  value: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div className="account-field">
      <Label htmlFor={id}>{title}</Label>
      <Input id={id} defaultValue={value} type={type} required />
    </div>
  );
}
function Connection({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const [connected, setConnected] = useState(false);
  return (
    <div className="account-preference">
      <div>
        <strong>{name}</strong>
        <p>{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setConnected(!connected);
          notify(
            connected ? 'Disconnected in preview' : 'Connected in preview',
          );
        }}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </Button>
    </div>
  );
}
const groupMeta = {
  identity: {
    title: 'Personal information',
    description: 'How you appear across your account.',
    Icon: Mail,
  },
  preferences: {
    title: 'Your preferences',
    description: 'A few details to make this space yours.',
    Icon: Grid,
  },
  security: {
    title: 'Sign-in & security',
    description: 'Keep your account protected.',
    Icon: KeyRound,
  },
  sessions: {
    title: 'Devices & sessions',
    description: 'Review where you are signed in.',
    Icon: Monitor,
  },
  notifications: {
    title: 'Notifications',
    description: 'Choose what reaches you and where.',
    Icon: Bell,
  },
  channels: {
    title: 'Delivery channels',
    description: 'Control how updates are delivered.',
    Icon: Mail,
  },
  billing: {
    title: 'Plan & billing',
    description: 'Manage your plan and billing details.',
    Icon: FileText,
  },
  connections: {
    title: 'Connected apps',
    description: 'Manage services linked to this account.',
    Icon: Grid,
  },
} as const;
type Group = keyof typeof groupMeta;
function groupsFor(screen: Screen): Group[] {
  switch (screen.settingsFocus) {
    case 'security':
      return ['security', 'sessions'];
    case 'notifications':
      return ['notifications', 'channels'];
    case 'billing':
      return ['billing', 'identity'];
    case 'connections':
      return ['connections', 'security'];
    default:
      return screen.complexity === 'simple'
        ? ['identity', 'preferences']
        : ['identity', 'preferences', 'notifications', 'security'];
  }
}
function SettingsGroup({ group, screen }: { group: Group; screen: Screen }) {
  const [revoked, setRevoked] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const investor = screen.contentMode === 'investor';
  let content: ReactNode;
  switch (group) {
    case 'identity':
      content = (
        <>
          <div className="account-field-grid">
            <TextField title="Full name" value="Alex Morgan" />
            <TextField
              title="Email address"
              value="alex@example.com"
              type="email"
            />
          </div>
          <TextField
            title={investor ? 'Occupation' : 'Location'}
            value={investor ? 'Salaried professional' : 'Bengaluru, India'}
          />
        </>
      );
      break;
    case 'preferences':
      content = (
        <>
          <Preference
            title={investor ? 'Investment reminders' : 'Public profile'}
            description={
              investor
                ? 'Keep your monthly investment routine on track.'
                : 'Allow other members to discover your profile.'
            }
            initial
          />
          <Preference
            title={investor ? 'Market summaries' : 'Show activity'}
            description={
              investor
                ? 'A concise view of your watchlist and market moves.'
                : 'Share recent projects and collections with your network.'
            }
          />
          <Preference
            title="Personalized suggestions"
            description="Use your activity to suggest relevant content."
            initial
          />
        </>
      );
      break;
    case 'security':
      content = (
        <>
          <Preference
            title="Two-factor authentication"
            description="Require an additional verification step at sign-in."
            initial
          />
          <Preference
            title="New sign-in alerts"
            description="Get notified when a new device accesses your account."
            initial
          />
          <div className="account-preference">
            <div>
              <strong>Password</strong>
              <p>Update your password regularly.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePassword(true)}
            >
              Change
            </Button>
          </div>
        </>
      );
      break;
    case 'sessions':
      content = (
        <>
          <div className="account-preference">
            <div>
              <strong>Chrome · macOS</strong>
              <p>Bengaluru · Active now</p>
            </div>
            <Badge variant="outline">This device</Badge>
          </div>
          {!revoked && (
            <div className="account-preference">
              <div>
                <strong>Safari · iPhone</strong>
                <p>Last active yesterday</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRevoked(true);
                  notify('Session removed in preview');
                }}
              >
                Sign out
              </Button>
            </div>
          )}
        </>
      );
      break;
    case 'notifications':
      content = (
        <>
          <Preference
            title={investor ? 'Price alerts' : 'Activity updates'}
            description={
              investor
                ? 'When a watchlist price reaches your target.'
                : 'Replies, mentions and updates to your work.'
            }
            initial
          />
          <Preference
            title={investor ? 'Order updates' : 'Weekly digest'}
            description={
              investor
                ? 'Status changes to your investment orders.'
                : 'A weekly summary of the things you follow.'
            }
            initial
          />
          <Preference
            title="Product news"
            description="New features, tips and occasional announcements."
          />
        </>
      );
      break;
    case 'channels':
      content = (
        <>
          <Preference
            title="Push notifications"
            description="Receive updates on your devices."
            initial
          />
          <Preference
            title="Email"
            description="Send updates to alex@example.com."
            initial
          />
          <Preference
            title="Quiet hours"
            description="Pause non-essential alerts from 10 pm to 8 am."
          />
        </>
      );
      break;
    case 'billing':
      content = (
        <>
          <div className="account-plan">
            <div>
              <p className="account-eyebrow">Current plan</p>
              <h3>Personal Plus</h3>
              <p>Your next renewal is 1 October.</p>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
          <TextField
            title="Billing email"
            value="alex@example.com"
            type="email"
          />
          <Preference
            title="Email receipts"
            description="Send a receipt after each renewal."
            initial
          />
        </>
      );
      break;
    case 'connections':
      content = (
        <>
          <Connection
            name="Google"
            description="Calendar and account sign-in"
          />
          <Connection name="GitHub" description="Projects and collaboration" />
          <Connection name="Notion" description="Notes and workspace pages" />
        </>
      );
      break;
  }
  return (
    <>
      {content}
      <Dialog open={changePassword} onOpenChange={setChangePassword}>
        <DialogContent>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            This is a local demonstration. No account credentials are changed.
          </DialogDescription>
          <form
            className="account-fields"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setChangePassword(false);
              notify('Password change preview complete');
            }}
          >
            <TextField title="New password" value="" type="password" />
            <Button type="submit">Update password</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function SettingsPanel({ screen }: { screen: Screen }) {
  const groups = groupsFor(screen);
  const [active, setActive] = useState<Group>(groups[0]);
  const current = groups.includes(active) ? active : groups[0];
  const kind = getBlueprint(screen).id.split(':')[1];
  const meta = groupMeta[current];
  const section = (group: Group) => {
    const item = groupMeta[group];
    return (
      <section key={group} className="account-settings-group">
        <header>
          <item.Icon size={20} />
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </header>
        <SettingsGroup group={group} screen={screen} />
      </section>
    );
  };
  return (
    <form
      className={`account-settings settings-${kind}`}
      onSubmit={(e) => {
        e.preventDefault();
        notify('Settings saved in this preview');
      }}
    >
      {kind === 'split' && (
        <aside className="account-summary">
          <Identity mode={screen.contentMode} />
          <Badge variant="outline">Personal account</Badge>
          <p>Your profile, preferences and account details in one place.</p>
          <div>
            <strong>Account status</strong>
            <p>Verified · In good standing</p>
          </div>
        </aside>
      )}
      {kind === 'sidebar' ? (
        <>
          <nav className="settings-category-nav" aria-label="Settings sections">
            {groups.map((group) => {
              const item = groupMeta[group];
              return (
                <Button
                  key={group}
                  variant="ghost"
                  aria-pressed={current === group}
                  onClick={() => setActive(group)}
                >
                  <item.Icon size={20} />
                  {item.title}
                </Button>
              );
            })}
          </nav>
          <div className="settings-editor">
            <p className="account-eyebrow">Account / {meta.title}</p>
            {groups.map((group) => (
              <div key={group} hidden={group !== current}>
                {section(group)}
              </div>
            ))}
            <div className="settings-save">
              <Button type="submit">Save changes</Button>
              <span>Saved only in this preview</span>
            </div>
          </div>
        </>
      ) : (
        <div className="settings-sections">
          {kind === 'accordion' ? (
            <Accordion defaultValue={[groups[0]]}>
              {groups.map((group) => (
                <AccordionItem value={group} key={group}>
                  <AccordionTrigger>{groupMeta[group].title}</AccordionTrigger>
                  <AccordionContent>
                    <p className="settings-section-description">
                      {groupMeta[group].description}
                    </p>
                    <SettingsGroup group={group} screen={screen} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            groups.map(section)
          )}
          <div className="settings-save">
            <Button type="submit">Save changes</Button>
            <span>Saved only in this preview</span>
          </div>
        </div>
      )}
    </form>
  );
}
