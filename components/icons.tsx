'use client';
import { forwardRef, type SVGProps } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  ArrowDown02Icon as Glyph0,
  ArrowUp02Icon as Glyph1,
  ArrowUpRight01Icon as Glyph2,
  Notification01Icon as Glyph3,
  Package01Icon as Glyph4,
  Tick02Icon as Glyph5,
  ArrowDown01Icon as Glyph6,
  ArrowLeft01Icon as Glyph7,
  ArrowRight01Icon as Glyph8,
  ArrowUp01Icon as Glyph9,
  CheckmarkCircle02Icon as Glyph10,
  CodeIcon as Glyph11,
  CommandIcon as Glyph12,
  ViewIcon as Glyph13,
  File01Icon as Glyph14,
  Folder01Icon as Glyph15,
  InformationCircleIcon as Glyph16,
  Key01Icon as Glyph17,
  Loading03Icon as Glyph18,
  Mail01Icon as Glyph19,
  MinusSignIcon as Glyph20,
  ComputerIcon as Glyph21,
  MoreHorizontalIcon as Glyph22,
  CancelCircleIcon as Glyph23,
  SidebarLeft01Icon as Glyph24,
  Add01Icon as Glyph25,
  ReloadIcon as Glyph26,
  Search01Icon as Glyph27,
  Settings01Icon as Glyph28,
  Settings02Icon as Glyph29,
  SmartPhone01Icon as Glyph30,
  SparklesIcon as Glyph31,
  StarIcon as Glyph32,
  Tablet01Icon as Glyph33,
  Alert02Icon as Glyph34,
  Cancel01Icon as Glyph35,
  FlashIcon as Glyph36,
  Home01Icon as Glyph37,
  ChartLineData02Icon as Glyph38,
  PercentCircleIcon as Glyph39,
  Money02Icon as Glyph40,
  Grid02Icon as Glyph41,
  ShoppingBag01Icon as Glyph42,
  HeadphonesIcon as Glyph43,
  QrCodeIcon as QrGlyph,
} from '@hugeicons/core-free-icons';
function icon(glyph: IconSvgElement, name: string) {
  const Icon = forwardRef<
    SVGSVGElement,
    SVGProps<SVGSVGElement> & { size?: string | number }
  >(({ size = 20, className = '', style, strokeWidth, ...props }, ref) => {
    const tokenSize =
      typeof size === 'number'
        ? [12, 16, 20, 24, 28].reduce(
            (best, n) =>
              Math.abs(n - size) < Math.abs(best - size) ? n : best,
            20,
          )
        : size;
    return (
      <span
        className={'mds-iconview ' + className}
        style={{ width: tokenSize, height: tokenSize, ...style }}
      >
        <HugeiconsIcon
          ref={ref}
          icon={glyph}
          size={tokenSize}
          strokeWidth={Number(strokeWidth ?? 1.5)}
          aria-hidden={props['aria-label'] ? undefined : true}
          {...props}
        />
      </span>
    );
  });
  Icon.displayName = name;
  return Icon;
}
export const ArrowDown = icon(Glyph0, 'ArrowDown');
export const ArrowUp = icon(Glyph1, 'ArrowUp');
export const ArrowUpRight = icon(Glyph2, 'ArrowUpRight');
export const Bell = icon(Glyph3, 'Bell');
export const Box = icon(Glyph4, 'Box');
export const Check = icon(Glyph5, 'Check');
export const ChevronDown = icon(Glyph6, 'ChevronDown');
export const ChevronLeft = icon(Glyph7, 'ChevronLeft');
export const ChevronRight = icon(Glyph8, 'ChevronRight');
export const ChevronUp = icon(Glyph9, 'ChevronUp');
export const CircleCheck = icon(Glyph10, 'CircleCheck');
export const Code2 = icon(Glyph11, 'Code2');
export const Command = icon(Glyph12, 'Command');
export const Eye = icon(Glyph13, 'Eye');
export const FileText = icon(Glyph14, 'FileText');
export const Folder = icon(Glyph15, 'Folder');
export const Info = icon(Glyph16, 'Info');
export const KeyRound = icon(Glyph17, 'KeyRound');
export const Loader2 = icon(Glyph18, 'Loader2');
export const Mail = icon(Glyph19, 'Mail');
export const Minus = icon(Glyph20, 'Minus');
export const Monitor = icon(Glyph21, 'Monitor');
export const MoreHorizontal = icon(Glyph22, 'MoreHorizontal');
export const OctagonX = icon(Glyph23, 'OctagonX');
export const PanelLeft = icon(Glyph24, 'PanelLeft');
export const Plus = icon(Glyph25, 'Plus');
export const RotateCcw = icon(Glyph26, 'RotateCcw');
export const Search = icon(Glyph27, 'Search');
export const Settings = icon(Glyph28, 'Settings');
export const Settings2 = icon(Glyph29, 'Settings2');
export const Smartphone = icon(Glyph30, 'Smartphone');
export const Sparkles = icon(Glyph31, 'Sparkles');
export const Star = icon(Glyph32, 'Star');
export const Tablet = icon(Glyph33, 'Tablet');
export const TriangleAlert = icon(Glyph34, 'TriangleAlert');
export const X = icon(Glyph35, 'X');
export const Zap = icon(Glyph36, 'Zap');
export const Home = icon(Glyph37, 'Home');
export const Chart = icon(Glyph38, 'Chart');
export const Percent = icon(Glyph39, 'Percent');
export const Money = icon(Glyph40, 'Money');
export const Grid = icon(Glyph41, 'Grid');
export const ShoppingBag = icon(Glyph42, 'ShoppingBag');
export const Headphones = icon(Glyph43, 'Headphones');
export const ArrowDownIcon = ArrowDown;
export const ArrowUpIcon = ArrowUp;
export const ArrowUpRightIcon = ArrowUpRight;
export const BellIcon = Bell;
export const BoxIcon = Box;
export const CheckIcon = Check;
export const ChevronDownIcon = ChevronDown;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const ChevronUpIcon = ChevronUp;
export const CircleCheckIcon = CircleCheck;
export const Code2Icon = Code2;
export const CommandIcon = Command;
export const EyeIcon = Eye;
export const FileTextIcon = FileText;
export const FolderIcon = Folder;
export const InfoIcon = Info;
export const KeyRoundIcon = KeyRound;
export const Loader2Icon = Loader2;
export const MailIcon = Mail;
export const MinusIcon = Minus;
export const MonitorIcon = Monitor;
export const MoreHorizontalIcon = MoreHorizontal;
export const OctagonXIcon = OctagonX;
export const PanelLeftIcon = PanelLeft;
export const PlusIcon = Plus;
export const RotateCcwIcon = RotateCcw;
export const SearchIcon = Search;
export const SettingsIcon = Settings;
export const Settings2Icon = Settings2;
export const SmartphoneIcon = Smartphone;
export const SparklesIcon = Sparkles;
export const StarIcon = Star;
export const TabletIcon = Tablet;
export const TriangleAlertIcon = TriangleAlert;
export const XIcon = X;
export const ZapIcon = Zap;
export const HomeIcon = Home;
export const ChartIcon = Chart;
export const PercentIcon = Percent;
export const MoneyIcon = Money;
export const GridIcon = Grid;
export const ShoppingBagIcon = ShoppingBag;
export const HeadphonesIcon = Headphones;

export const ArrowLeftIcon = ChevronLeft;

export const QrCode = icon(QrGlyph, 'QrCode');
