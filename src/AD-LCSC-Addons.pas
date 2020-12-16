procedure onMouseWheelUp(Sender: TObject; Shift: TShiftState; MousePos: TPoint; var Handled: Boolean);
begin
  Handled:=True;
  SendMessage(TStringGrid(Sender).Handle, WM_VSCROLL,SB_LINEDOWN,0); 
end;

procedure OnMouseWheelDown(Sender: TObject; Shift: TShiftState; MousePos: TPoint; var Handled: Boolean);
begin
  Handled:=True;
  SendMessage(TStringGrid(Sender).Handle,WM_VSCROLL,SB_LINEUP,0)
end;
