# linkdump

## Where do I get it?

On [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/linkdump).

## What's that?

Linkdump is a Firefox extension which allows you to store links, URL, and bookmarks
in the local storage until you are ready to dump them in a file or copy them in the
clipboard. At the moment, the following link formats are supported:
- text
- markdown
- HTML
- dokuwiki
- phpbb.

## How do I add entries in the storage?

There is different ways to add entries in the storage. At the moment, only the
following are available:
1. URL are added by clicking the ![Linkdump icon](icons/linkdump-16.png) icon
available in the address bar.
1. Link are added by clicking the ![Linkdump icon](icons/linkdump-16.png) icon
available in the link context menu.
1. Image source are added by clicking the ![Linkdump icon](icons/linkdump-16.png)
icon available in the image context menu.
1. Bookmarks are added by clicking the ![Linkdump icon](icons/linkdump-16.png)
icon available in the bookmark context menu
1. Bookmark folders are added recursively by clicking the
![Linkdump icon](icons/linkdump-16.png) icon available in the bookmark folder
context menu.

## How do I retrieve the storage content?

The first thing to do is to display the storage content by clicking the
![Linkdump icon](icons/linkdump-16.png) button available in the interface.
Doing so will display the content and the available actions.

You can now select between saving the dump content into a file or copy it to the
clipboard. The default format is text unless you've changed it in the configuration
page. You can also select a format prior selecting an action.

When the download action is finished, the storage is cleared. It's not the case
with the copy action.

## How is this useful?

If you want to download a bunch of videos, you can dump links in a text file and
use that file as input for *[youtube-dl](https://rg3.github.io/youtube-dl/)*.
```
youtube-dl --batch-file linkdump.txt
youtube-dl -a linkdump.txt
```

If you want to download a bunch of files, you can dump links in a text file and
use that file as input for *[wget](https://www.gnu.org/software/wget/)*.
```
wget --input-file linkdump.txt
wget -i linkdump.txt
```

If you want to add a list of links in your blog, you can dump links in a markdown
or html file and use that file as a starting point for your post.
If you want to share links on a phpBB forum, you can dump links in the appropriated
format.

## Attributions

Icons are part of [Font Awesome](https://fontawesome.com/). They are used under the [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/) agreement.  
