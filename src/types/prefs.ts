export interface Policies {
  [hostname: string]: string[];
}

export interface Prefs {
  [key: string]: unknown;
  visibilityState: boolean;
  hidden: boolean;
  blur: boolean;
  focus: boolean;
  redirect: boolean;
  visibility: boolean;
  pointercapture: boolean;
  mouseleave: boolean;
  mouseout: boolean;
  log: boolean;
  faqs: boolean;
  policies: Policies | null;
  hosts: string[];
}

export const DEFAULT_PREFS: Prefs = {
  visibilityState: true,
  hidden: true,
  blur: true,
  focus: true,
  redirect: true,
  visibility: true,
  pointercapture: true,
  mouseleave: true,
  mouseout: true,
  log: false,
  faqs: true,
  policies: null,
  hosts: [],
};