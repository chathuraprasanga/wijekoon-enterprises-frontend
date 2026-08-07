import {
  ActionIcon,
  AppShellHeader,
  AppShellNavbar,
  Avatar,
  Badge,
  Button,
  createTheme,
  Menu,
  Modal,
  NavLink,
  Paper,
  PasswordInput,
  PinInput,
  SegmentedControl,
  TextInput,
  ThemeIcon,
  Tooltip,
  type MantineColorsTuple,
  type MantineThemeOverride,
  Select,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const mix = (
  from: [number, number, number],
  to: [number, number, number],
  ratio: number,
): string => {
  const channel = (a: number, b: number) => Math.round(a + (b - a) * ratio);
  return `#${[channel(from[0], to[0]), channel(from[1], to[1]), channel(from[2], to[2])]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
};

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// Generates a 10-shade Mantine palette from a single brand hex, with the
// source color preserved exactly at index 6 (Mantine's default filled shade).
const generateShades = (hex: string): MantineColorsTuple => {
  const rgb = hexToRgb(hex);
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  const lightRatios = [0.9, 0.75, 0.58, 0.42, 0.26, 0.12];
  const darkRatios = [0.15, 0.3, 0.45];
  return [
    ...lightRatios.map((ratio) => mix(rgb, white, ratio)),
    hex,
    ...darkRatios.map((ratio) => mix(rgb, black, ratio)),
  ] as unknown as MantineColorsTuple;
};

const GLASS_HEADER_CLASSNAME =
  'border-b border-[var(--mantine-color-default-border)] backdrop-blur-md ' +
  'bg-[color-mix(in_srgb,var(--mantine-color-body)_75%,transparent)]';

const NAVBAR_CLASSNAME = 'border-r border-[var(--mantine-color-default-border)]';

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'teal',
  fontFamily: 'Ubuntu, sans-serif',
  defaultRadius: 'md',
  colors: {
    teal: generateShades('#025864'),
    brandGreen: generateShades('#00D47E'),
  },
  components: {
    TextInput: TextInput.extend({
      defaultProps: {
        size: 'md',
      },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        size: 'md',
      },
    }),
    Select: Select.extend({
      defaultProps: {
        size: 'md',
      },
    }),
    PinInput: PinInput.extend({
      defaultProps: {
        size: 'md',
        type: 'number',
        oneTimeCode: true,
      },
    }),
    Button: Button.extend({
      defaultProps: {
        size: 'md',
      },
    }),
    Notifications: Notifications.extend({
      defaultProps: {
        position: 'top-right',
        autoClose: 4000,
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: 'subtle',
        radius: 'md',
      },
    }),
    Avatar: Avatar.extend({
      defaultProps: {
        radius: 'xl',
        color: 'teal',
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        variant: 'light',
      },
    }),
    Menu: Menu.extend({
      defaultProps: {
        shadow: 'md',
        radius: 'md',
        width: 200,
        position: 'bottom-end',
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'lg',
      },
    }),
    NavLink: NavLink.extend({
      defaultProps: {
        variant: 'filled',
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        radius: 'lg',
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        size: 'xs',
      },
    }),
    ThemeIcon: ThemeIcon.extend({
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        position: 'right',
        withArrow: true,
      },
    }),

    AppShellHeader: AppShellHeader.extend({
      defaultProps: {
        className: GLASS_HEADER_CLASSNAME,
      },
    }),
    AppShellNavbar: AppShellNavbar.extend({
      defaultProps: {
        className: NAVBAR_CLASSNAME,
      },
    }),
  },
});
