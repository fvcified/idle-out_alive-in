export {};

declare global {
  interface FeaturePolicy {
    allowsFeature(feature: string): boolean;
  }
  interface Document {
    permissionsPolicy?: FeaturePolicy;
    featurePolicy?: FeaturePolicy;
  }
}