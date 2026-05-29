declare module 'react-native-maps' {
  import { Component } from 'react';
  export default class MapView extends Component<any> {}
  export class Marker extends Component<any> {}
}

declare module 'react-native-vision-camera' {
  export function useCameraDevice(_type: string): any;
  export function useCameraPermission(): { hasPermission: boolean; requestPermission: () => Promise<boolean> };
  export class Camera extends React.Component<any> {
    takePhoto(_opts?: any): Promise<{ path: string }>;
  }
}
