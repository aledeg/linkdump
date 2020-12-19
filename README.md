# linkdump

## Where do I get it?

On [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/linkdump).

## What's that?

Linkdump is a Firefox extension which allows you to store URLs and their title in the local storage until you are ready to dump them to a file or copy them to the clipboard.
URLs can be extracted from links, tabs, bookmarks and images.
At the moment, the following output formats are supported:
- text,
- markdown,
- HTML,
- dokuwiki,
- phpbb,
- reStructured.

## How do I store URLs?

There is different ways to add entries to the storage.

**Add the tab URL**  
Click on the ![Linkdump icon](icons/linkdump-16.png) icon available in the address bar.

**Add a single link**  
Display its context menu then click the "Add to dump" action identified by the ![Linkdump icon](icons/linkdump-16.png) icon.

**Add an image source**  
See "Add a single link" above.

**Add a single bookmark**  
See "Add a single link" above.

**Add all bookmarks within a bookmark folder**  
See "Add a single link" above.
This will retrieve recursively all bookmarks available in the selected bookmark folder.

**Add all links from a page**  
Display the page context menu then click the "Scrape links" action under the linkdump menu item. This will display a filter box used to match links before adding them to the dump.  
If the filter is empty, all links are added.  
If the filter is not empty, only links matching the filter are added.
If you want to invert the filter, prepend the filter with `!`.

**Add multiple links from a page**  
Display the page context menu then click the "Capture links" action under the linkdump menu item. Now, all links are captured which means that when you click on one, it is added to the dump instead of being opened.  

## How do I retrieve the storage content?

Display the storage content by clicking the ![Linkdump icon](icons/linkdump-16.png) button available in the interface.
This will display also the available actions.

Select between saving the dump content to a file or copy it to the clipboard then select the desired format.

Depending the configuration, the dump can be cleared after completion.

## How is this useful?

Everytime you need to get URLs either to perform automated actions on them or to display them with their title in a documentation or in a blog post, you can do that without the hassle to switch back and forth between your input and your output.

The `text` output is particularly suited for batch downloading either videos with *[youtube-dl](https://rg3.github.io/youtube-dl/)* or files with *[wget](https://www.gnu.org/software/wget/)*.
Here are some examples :
```bash
# Downloading videos with youtube-dl
youtube-dl --batch-file linkdump.txt
youtube-dl -a linkdump.txt

# Downloading files with wget
wget --input-file linkdump.txt
wget -i linkdump.txt
```

The `markdown` output is particularly suited for blog posts, README files, github comments, etc.

The `reStructured` output is particularly suited for blog posts.

## Attributions

Icons are part of [Font Awesome](https://fontawesome.com/). They are used under the [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/) agreement.  
