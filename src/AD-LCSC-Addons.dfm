object MainForm: TForm1
  ClientWidth = 1000
  ClientHeight = 600

  BorderIcons = [biSystemMenu, biMinimize]
  BorderStyle = bsSingle
  Color = clWhite
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = 20
  Font.Name = 'Tahoma'
  Font.Style = []
  FormStyle = fsStayOnTop
  OldCreateOrder = False
  Position = poDesigned
  OnShow = onMainShow

  object SearchInput: TEdit
    Width = 890
    Height = 25
    Left = 10
    Top = 10

    OnKeyPress = onEnter
  end

  object SearchButton: TButton
    Width = 80
    Height = 30
    Left = 910
    Top = 9

    OnClick = onSearch
    OnMouseMove = onMouseMove
  end

  object SearchResult: TStringGrid
    Width = 850
    Height = 480
    Left = 10
    Top = 50

    ColCount = 7
    DefaultRowHeight = 20
    FixedCols = 0
    FixedRows = 1
    RowCount = 1
    Options = [goFixedVertLine, goFixedHorzLine, goVertLine, goHorzLine, goRowSelect, goRowMoving, goThumbTracking]
    ParentFont = False
    OnMouseWheelUp = onMouseWheelUp
    OnMouseWheelDown = onMouseWheelDown
    OnClick = onPartSelected
    OnDblClick = onPartPlace
    ColWidths = (
      200
      200
      50
      200
      40
      80
      500)
  end

  object SchImg: TImage
    Width = 120
    Height = 120

    Left = 870
    Top = 50

    Center = True
    Proportional = True
  end

  object PcbImg: TImage
    Width = 120
    Height = 120

    Left = 870
    Top = 170

    Center = True
    Proportional = True
  end

  object PreviewImg: TImage
    Width = 120
    Height = 120

    Left = 870
    Top = 290

    Center = True
    Proportional = True
  end

  object Advertising: TPanel
    Width = 260
    Height = 50

    Left = 460
    Top = 540

    Color = clBlack
    Font.Color = clWhite
    Font.Height = 25
  end

  object Price: TLabel
    Left = 10
    Top = 540

    Font.Height = 50
    Font.Color = clRed
  end

  object Details: TLabel
    Left = 250
    Top = 560

    Font.Style = [fsUnderline]
    OnClick = onOpenDetails
    OnMouseMove = onMouseMove
  end

  object PageGroup: TGroupBox
    Width = 130
    Height = 50
    Left = 730
    Top = 540

    object PagePrevious: TButton
      Width = 20
      Height = 20
      Left = 10
      Top = 20

      Caption = '<<'
      Font.Height = 10
      OnClick = onPagePrevious
      OnMouseMove = onMouseMove
    end

    object PageCurrent: TLabel
      Left = 50
      Top = 20

      Caption = '0 / 0'
    end

    object PageNext: TButton
      Width = 20
      Height = 20
      Left = 100
      Top = 20

      Caption = '>>'
      Font.Height = 10
      OnClick = onPageNext
      OnMouseMove = onMouseMove
    end
  end

end
