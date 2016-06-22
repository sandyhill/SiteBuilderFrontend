module FilePicker {
  let Dropbox = window["Dropbox"] || {};
  
  export namespace query {
    export class FileQuery {
      private 
    }
  }
    
  namespace upload {
    function transferFromDropbox(extensions: string[] = []): void {
      Dropbox.choose({
        success: (files: string[]) => {},
        cancel: () => {},
        linkType: "direct",
        multiselect: true,
        extensions: extensions
      });
    }
  }
}

export default FilePicker;

/*
Dropbox success callback argument type:
file = {

    // Name of the file.
    name: "filename.txt",

    // URL to access the file, which varies depending on the linkType specified when the
    // Chooser was triggered.
    link: "https://...",

    // Size of the file in bytes.
    bytes: 464,

    // URL to a 64x64px icon for the file based on the file's extension.
    icon: "https://...",

    // A thumbnail URL generated when the user selects images and videos.
    // If the user didn't select an image or video, no thumbnail will be included.
    thumbnailLink: "https://...?bounding_box=75&mode=fit",

    // Boolean, whether or not the file is actually a directory
    isDir: false,
};
*/