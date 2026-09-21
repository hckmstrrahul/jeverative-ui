'use client';
import { forwardRef, type SVGProps } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import Glyph0 from '@hugeicons/core-free-icons/ArrowDown02Icon';
import Glyph1 from '@hugeicons/core-free-icons/ArrowUp02Icon';
import Glyph2 from '@hugeicons/core-free-icons/ArrowUpRight01Icon';
import Glyph3 from '@hugeicons/core-free-icons/Notification01Icon';
import Glyph4 from '@hugeicons/core-free-icons/Package01Icon';
import Glyph5 from '@hugeicons/core-free-icons/Tick02Icon';
import Glyph6 from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Glyph7 from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import Glyph8 from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Glyph9 from '@hugeicons/core-free-icons/ArrowUp01Icon';
import Glyph10 from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import Glyph11 from '@hugeicons/core-free-icons/CodeIcon';
import Glyph12 from '@hugeicons/core-free-icons/CommandIcon';
import Glyph13 from '@hugeicons/core-free-icons/ViewIcon';
import Glyph14 from '@hugeicons/core-free-icons/File01Icon';
import Glyph15 from '@hugeicons/core-free-icons/Folder01Icon';
import Glyph16 from '@hugeicons/core-free-icons/InformationCircleIcon';
import Glyph17 from '@hugeicons/core-free-icons/Key01Icon';
import Glyph18 from '@hugeicons/core-free-icons/Loading03Icon';
import Glyph19 from '@hugeicons/core-free-icons/Mail01Icon';
import Glyph20 from '@hugeicons/core-free-icons/MinusSignIcon';
import Glyph21 from '@hugeicons/core-free-icons/ComputerIcon';
import Glyph22 from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import Glyph23 from '@hugeicons/core-free-icons/CancelCircleIcon';
import Glyph24 from '@hugeicons/core-free-icons/SidebarLeft01Icon';
import Glyph25 from '@hugeicons/core-free-icons/Add01Icon';
import Glyph26 from '@hugeicons/core-free-icons/ReloadIcon';
import Glyph27 from '@hugeicons/core-free-icons/Search01Icon';
import Glyph28 from '@hugeicons/core-free-icons/Settings01Icon';
import Glyph29 from '@hugeicons/core-free-icons/Settings02Icon';
import Glyph30 from '@hugeicons/core-free-icons/SmartPhone01Icon';
import Glyph31 from '@hugeicons/core-free-icons/SparklesIcon';
import Glyph32 from '@hugeicons/core-free-icons/StarIcon';
import Glyph33 from '@hugeicons/core-free-icons/Tablet01Icon';
import Glyph34 from '@hugeicons/core-free-icons/Alert02Icon';
import Glyph35 from '@hugeicons/core-free-icons/Cancel01Icon';
import Glyph36 from '@hugeicons/core-free-icons/FlashIcon';
import Glyph37 from '@hugeicons/core-free-icons/Home01Icon';
import Glyph38 from '@hugeicons/core-free-icons/ChartLineData02Icon';
import Glyph39 from '@hugeicons/core-free-icons/PercentCircleIcon';
import Glyph40 from '@hugeicons/core-free-icons/Money02Icon';
import Glyph41 from '@hugeicons/core-free-icons/Grid02Icon';
import Glyph42 from '@hugeicons/core-free-icons/ShoppingBag01Icon';
import Glyph43 from '@hugeicons/core-free-icons/HeadphonesIcon';
import QrGlyph from '@hugeicons/core-free-icons/QrCodeIcon';
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
