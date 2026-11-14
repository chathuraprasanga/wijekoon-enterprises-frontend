import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Checkbox,
  createTheme,
  Drawer,
  Input,
  Menu,
  Modal,
  MultiSelect,
  Notification,
  NumberInput,
  Pagination,
  PasswordInput,
  Select,
  Skeleton,
  Switch,
  Tabs,
  Textarea,
  TextInput,
  Tooltip,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

const font = "'IBM Plex Sans', 'Noto Sans Sinhala', 'Noto Sans Tamil', system-ui, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

// Fallback ramp for Mantine internals; real colours come from the --ldg-* tokens below.
const forest: MantineColorsTuple = [
  '#e2efeb',
  '#cfe4dd',
  '#9bc7bc',
  '#6fb09f',
  '#34b79c',
  '#1f9a82',
  '#14806b',
  '#0f5c4f',
  '#0b4a40',
  '#083a32',
];

// Helper text sits under the field (label, input, description, error), as in the design.
const wrapperOrder: ('label' | 'input' | 'description' | 'error')[] = [
  'label',
  'input',
  'description',
  'error',
];
const control = { size: 'sm' as const, inputWrapperOrder: wrapperOrder };

export const theme = createTheme({
  colors: { forest },
  primaryColor: 'forest',
  primaryShade: { light: 7, dark: 4 },
  autoContrast: true,
  fontFamily: font,
  fontFamilyMonospace: mono,
  headings: {
    fontFamily: font,
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '24px', lineHeight: '1.25' },
      h2: { fontSize: '20px', lineHeight: '1.25' },
      h3: { fontSize: '16px', lineHeight: '1.25' },
      h4: { fontSize: '14px', lineHeight: '1.3' },
    },
  },
  fontSizes: { xs: '12px', sm: '13px', md: '14px', lg: '16px', xl: '20px' },
  lineHeights: { xs: '1.45', sm: '1.45', md: '1.45', lg: '1.45', xl: '1.25' },
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },
  defaultRadius: 'sm',
  shadows: {
    xs: 'none',
    sm: 'var(--ldg-shadow-1)',
    md: 'var(--ldg-shadow-2)',
    lg: 'var(--ldg-shadow-3)',
    xl: 'var(--ldg-shadow-3)',
  },
  breakpoints: { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '88em' },
  focusRing: 'auto',
  cursorType: 'pointer',
  respectReducedMotion: true,
  other: { density: { comfortable: 52, dense: 40 } },
  components: {
    Button: Button.extend({
      defaultProps: { size: 'sm', fw: 500 },
      // Text on solid fills follows the token: white in light mode, dark on the lighter dark-mode fills.
      vars: (_t, props) =>
        !props.variant || props.variant === 'filled'
          ? {
              root: {
                '--button-color':
                  props.color === 'red' ? 'var(--ldg-on-fill)' : 'var(--ldg-on-accent)',
              },
            }
          : { root: {} },
      styles: (_t, props) => ({
        root:
          props.variant === 'default'
            ? { borderColor: 'var(--ldg-border-input)', color: 'var(--ldg-text)' }
            : {},
      }),
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { variant: 'default', size: 32, radius: 'sm' },
      styles: (_t, props) => ({
        root: props.variant === 'subtle' ? {} : { borderColor: 'var(--ldg-border-input)' },
      }),
    }),
    Badge: Badge.extend({
      defaultProps: { radius: 'xs', size: 'md', tt: 'none', fw: 500 },
      styles: { root: { fontSize: 12 }, label: { overflow: 'visible' } },
    }),
    Input: Input.extend({
      styles: {
        input: {
          background: 'var(--ldg-surface-raised)',
          borderColor: 'var(--ldg-border-input)',
          color: 'var(--ldg-text)',
          transition: 'border-color var(--ldg-motion-fast), box-shadow var(--ldg-motion-fast)',
        },
      },
    }),
    InputWrapper: Input.Wrapper.extend({
      styles: {
        label: { fontWeight: 500, color: 'var(--ldg-text)', marginBottom: 4 },
        description: { color: 'var(--ldg-text-muted)', marginTop: 4 },
        error: { color: 'var(--ldg-danger-text)', marginTop: 4 },
        required: { color: 'var(--ldg-danger-text)' },
      },
    }),
    TextInput: TextInput.extend({ defaultProps: control }),
    PasswordInput: PasswordInput.extend({ defaultProps: control }),
    NumberInput: NumberInput.extend({ defaultProps: { size: 'sm' } }),
    Textarea: Textarea.extend({ defaultProps: { size: 'sm' } }),
    Select: Select.extend({
      defaultProps: { size: 'sm', allowDeselect: false, checkIconPosition: 'right' },
    }),
    MultiSelect: MultiSelect.extend({ defaultProps: { size: 'sm', checkIconPosition: 'right' } }),
    DateInput: DateInput.extend({ defaultProps: { size: 'sm', valueFormat: 'DD MMM YYYY' } }),
    Checkbox: Checkbox.extend({ styles: { input: { borderColor: 'var(--ldg-border-input)' } } }),
    Switch: Switch.extend({ styles: { track: { borderColor: 'var(--ldg-border-input)' } } }),
    Pagination: Pagination.extend({ defaultProps: { size: 'sm', radius: 'sm', withEdges: false } }),
    Tabs: Tabs.extend({ defaultProps: { keepMounted: false } }),
    Menu: Menu.extend({
      defaultProps: { shadow: 'sm', radius: 'md', width: 220, withinPortal: true },
      styles: {
        dropdown: {
          background: 'var(--ldg-surface-raised)',
          border: '1px solid var(--ldg-border)',
          padding: 4,
        },
        item: { borderRadius: 6 },
      },
    }),
    Tooltip: Tooltip.extend({ defaultProps: { openDelay: 300, withArrow: false } }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'md',
        shadow: 'lg',
        overlayProps: { backgroundOpacity: 0.5, blur: 0, color: '#1f1d1a' },
        transitionProps: { duration: 200, transition: 'fade' },
      },
      styles: {
        content: { background: 'var(--ldg-surface-raised)', border: '1px solid var(--ldg-border)' },
        header: {
          padding: '14px 20px',
          borderBottom: '1px solid var(--ldg-border)',
          background: 'var(--ldg-surface-raised)',
        },
        title: { fontSize: 16, fontWeight: 600 },
        body: { padding: 0 },
      },
    }),
    Drawer: Drawer.extend({
      defaultProps: {
        position: 'right',
        shadow: 'lg',
        overlayProps: { backgroundOpacity: 0.5, blur: 0, color: '#1f1d1a' },
        transitionProps: { duration: 200 },
      },
      styles: {
        content: {
          background: 'var(--ldg-surface-raised)',
          borderLeft: '1px solid var(--ldg-border)',
        },
        header: { padding: '16px 20px', borderBottom: '1px solid var(--ldg-border)' },
        title: { fontSize: 20, fontWeight: 600 },
        body: { padding: 0, height: 'calc(100% - 66px)' },
      },
    }),
    Notification: Notification.extend({
      defaultProps: { radius: 'md', withBorder: true },
      styles: {
        root: {
          background: 'var(--ldg-surface-raised)',
          borderColor: 'var(--ldg-border)',
          boxShadow: 'var(--ldg-shadow-2)',
          padding: '12px 14px',
          alignItems: 'flex-start',
        },
        title: { color: 'var(--ldg-text)', fontWeight: 600, fontSize: 14 },
        description: { color: 'var(--ldg-text-muted)', fontSize: 13 },
        icon: { background: 'transparent', width: 20, height: 20, marginTop: 1 },
        closeButton: { color: 'var(--ldg-text-muted)' },
      },
    }),
    Alert: Alert.extend({ defaultProps: { radius: 'md', variant: 'light' } }),
    Skeleton: Skeleton.extend({ defaultProps: { radius: 'sm' } }),
  },
});

// Map Mantine's colour variables onto the --ldg-* tokens so every Mantine component
// (including ones we never extended) follows the design system in both colour schemes.
const shared = {
  '--mantine-color-body': 'var(--ldg-surface)',
  '--mantine-color-text': 'var(--ldg-text)',
  '--mantine-color-dimmed': 'var(--ldg-text-muted)',
  '--mantine-color-placeholder': 'var(--ldg-text-subtle)',
  '--mantine-color-bright': 'var(--ldg-text)',
  '--mantine-color-anchor': 'var(--ldg-accent-text)',
  '--mantine-color-default': 'var(--ldg-surface-raised)',
  '--mantine-color-default-hover': 'var(--ldg-surface-sunken)',
  '--mantine-color-default-color': 'var(--ldg-text)',
  '--mantine-color-default-border': 'var(--ldg-border)',
  '--mantine-color-error': 'var(--ldg-danger-text)',
  '--mantine-color-disabled': 'var(--ldg-surface-sunken)',
  '--mantine-color-disabled-color': 'var(--ldg-text-subtle)',
  '--mantine-color-disabled-border': 'var(--ldg-border)',
  '--mantine-primary-color-filled': 'var(--ldg-accent)',
  '--mantine-primary-color-filled-hover': 'var(--ldg-accent-hover)',
  '--mantine-primary-color-light': 'var(--ldg-accent-subtle)',
  '--mantine-primary-color-light-hover': 'var(--ldg-accent-subtle)',
  '--mantine-primary-color-light-color': 'var(--ldg-accent-subtle-text)',
  '--mantine-primary-color-contrast': 'var(--ldg-on-accent)',
  '--mantine-color-forest-filled': 'var(--ldg-accent)',
  '--mantine-color-forest-filled-hover': 'var(--ldg-accent-hover)',
  '--mantine-color-forest-light': 'var(--ldg-accent-subtle)',
  '--mantine-color-forest-light-color': 'var(--ldg-accent-subtle-text)',
  '--mantine-color-forest-text': 'var(--ldg-accent-text)',
  '--mantine-color-forest-outline': 'var(--ldg-accent)',
  '--mantine-color-red-filled': 'var(--ldg-danger-fill)',
  '--mantine-color-red-filled-hover': 'var(--ldg-danger-text)',
  '--mantine-color-red-light': 'var(--ldg-danger-subtle)',
  '--mantine-color-red-light-hover': 'var(--ldg-danger-subtle)',
  '--mantine-color-red-light-color': 'var(--ldg-danger-text)',
  '--mantine-color-red-text': 'var(--ldg-danger-text)',
  '--mantine-color-red-outline': 'var(--ldg-danger-fill)',
  '--mantine-color-green-filled': 'var(--ldg-success-fill)',
  '--mantine-color-green-light': 'var(--ldg-success-subtle)',
  '--mantine-color-green-light-color': 'var(--ldg-success-text)',
  '--mantine-color-green-text': 'var(--ldg-success-text)',
  '--mantine-color-yellow-filled': 'var(--ldg-warning-fill)',
  '--mantine-color-yellow-light': 'var(--ldg-warning-subtle)',
  '--mantine-color-yellow-light-color': 'var(--ldg-warning-text)',
  '--mantine-color-yellow-text': 'var(--ldg-warning-text)',
  '--mantine-color-orange-filled': 'var(--ldg-warning-fill)',
  '--mantine-color-orange-light': 'var(--ldg-warning-subtle)',
  '--mantine-color-orange-light-color': 'var(--ldg-warning-text)',
  '--mantine-color-orange-text': 'var(--ldg-warning-text)',
  '--mantine-color-blue-filled': 'var(--ldg-info-fill)',
  '--mantine-color-blue-light': 'var(--ldg-info-subtle)',
  '--mantine-color-blue-light-color': 'var(--ldg-info-text)',
  '--mantine-color-blue-text': 'var(--ldg-info-text)',
  '--mantine-color-gray-light': 'var(--ldg-surface-sunken)',
  '--mantine-color-gray-light-color': 'var(--ldg-text-muted)',
  '--mantine-color-gray-text': 'var(--ldg-text-muted)',
};

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    // z-index order: content 0 · app 100 · modal/drawer 200 · popovers 300 · toasts 400 · skip link 9999
    '--mantine-z-index-app': '100',
    '--mantine-z-index-modal': '200',
    '--mantine-z-index-popover': '300',
    '--mantine-z-index-overlay': '200',
    '--mantine-z-index-max': '9999',
  },
  light: shared,
  dark: shared,
});
