export type Aviso = (texto: string, error?: boolean, detalle?: string) => void;

export type PanelProps = {
  avisar: Aviso;
  onSucio: (sucio: boolean) => void;
  onSesion: () => void;
};
