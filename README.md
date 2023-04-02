# AD LCSC Addons

English | [中文](./README_cn.md)

[![Preview](https://img.youtube.com/vi/Rm9fCbNcvS4/0.jpg)](https://www.youtube.com/watch?v=Rm9fCbNcvS4)

## Compile installation package

You can use Inno Setup to compile it yourself.

## Cautions and Disclaimers

1. The generated Altium Design file format cannot be 100% complete, please make sure to check carefully after importing the schematic and PCB, the author does not guarantee that no errors will be generated!
2. The author does not assume any responsibility for any damages caused by library errors and formatting errors! If you do not agree, please do not use it!
3. Altium Designer 19 is not supported at the moment, the exported files need to be opened in Altium Designer 18 and below, **Altium Designer 17 is recommended**.
4. The plugin works on Altium Designer 22.11.1

## Using the plugin
1. Launch the installer provided in the releases tab
2. Get required dependencies and run the backend server
```
cd %userprofile%\documents\AD-LCSC-Addons\backend\
npm install
node index.js
```

The backend server needs to be running every time you want to use the plugin.

## Known problems
- Imported schematic does not feature ERC
- Backend endpoint tends to freeze

## Optimization points
- Altium Design version check
- ~~Automatically set the maximum width of search results~~ (Finished)
- ~~Enter search after typing~~ (Finished)
- ~~Scrolling stalls when scrolling~~ (Fixed by changing request to asynchronous)
- Scrolling will select other cells, which may cause the picture to not match (Suggest using the mouse to pull the scroll bar)
- Multi-component processing
- 3D model display
- No need to open files, place components in the document directly
- File format conversion locally (Handled by remote server now)
- Adaptation of configuration files for other plugins during installation and uninstallation

## Technical barriers

The Altium Design plug-in interface requires the use of Delphi's dfm layout files, but only supports a very small number of components, thus limiting the implementation of the program UI and making many features difficult to implement.

However, another advantage is that the Altium Design plug-in supports calls from various languages, which is great.

### TWebBrowser

The original plan was to use TWebBrowser as a container to implement the JSBridge interface for internal web calls, but it is part of FMX and Altium Design only supports some VCL components.

A detailed implementation can be found at

https://delphidabbler.com/articles/article-22

https://www.ideasawakened.com/post/delphi-javascript-execution-ditch-twebbrowser-for-chakracore

### Image display

The initial plan was to convert the byte stream of HTTP requests to HEX String, but the implementation found that the dynamic assignment of Picture.

API documentation:

http://docwiki.embarcadero.com/Libraries/Sydney/en/Vcl.ExtCtrls.TImage

~~ However, the problem of using this method is that the upstream image size format is not uniform and requires additional scaling, which is not yet implemented. ~~ (Implemented via Proportional parameter)

## Acknowledgements

- LCSC
- Altium Library Loader

## Reference

- http://caidiot.blogspot.com/
- https://blog.mbedded.ninja/electronics/general/altium/altium-scripting-and-using-the-api/
- https://techdocs.altium.com/display/SCRT/Altium+Designer+API
- https://techdocs.altium.com/display/SCRT/Script+Examples+Reference
- https://techdocs.altium.com/display/SCRT/JScript((Statements))
- https://docs.microsoft.com/en-us/previous-versions/hbxc2t98(v=vs.71)
- http://doc.51windows.net/jscript5/?url=/jscript5/dir.htm
- https://www.altium.com/altium-dxp/overview
