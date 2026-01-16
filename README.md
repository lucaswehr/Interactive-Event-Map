
Welcome to the Interactive Event Map made by me!

This is a project that I just published in Decemeber, and is free to use by anyone. I used Heroku to deploy the website.
I'm also using mySQL to store and query data which taught me so much on how databases work and how it connects with my flask backend and react frontend.

TOOLS USED:
----------------------------------------
React.js

JavaScript

Python

mySQL

Heroku/AWS


RESTRAINTS:
-------------------------

1.) This website only works for U.S. cities

2.) Designed best for phones, but still works on any other platform

PROBLEM:
----------------------------------------

When I was on the ticketmaster app looking for events, I realized that It's sort of tedious/monotonous to find events in your location, as its just a big list that you can scroll with not much accessibility. This project helps people who don't know what event they're looking for, and just wanna browze events near them thats more simplistic and straight-forward. Ticketmaster also only shows offical, large events, and I thought It would be nice to empower users to create their own events, so smaller artists can shine more. 

OVERVIEW:
----------------------------------------

There are two modes of events: Ticketmaster events, and User-Generated Events. You can switch between the two from the filter panel.

TICKETMASTER EVENTS
----------------------------------------
This project lets the user use a interactive world map that zooms in and out to find events that in a certain desired area. I use leaflet.js for the map, and I use icons and popups as the events. These events are located where it'll be hosted, making it easy to find where they are. As well as that, when you hover over an icon, theres many details that you can see on the fly such as when the event date is and time, a description, the vibe of the event, and the genre. Most events will also have a link that takes you directly to where you can buy a ticket, making it easier than ever to buy a ticket based off what you're looking for. Something I added is a filter button that filters the events based on how you're feeling. For example some one the options you can choose from is "Intense', which finds events with the genre metal. Another filter is "Energetic" which shows the user sports such as hockey or football games or pop. There are many other filters such as "laid-back" that finds genres like country, "smooth" which finds Jazz or R&B events, and many more. More often than not people don't know what event they want to see, and I hope this project helps people find the best event for them based off their mood. 

Simplicity is what I'm focusing on, and this project has some simple instructions:

1.) Search any desired city you want

2.) Choose the number of events you want to see from the panel

3.) Press GO

4.) Use the filter buttons to adjust what you want to see

USER-GENERATED EVENTS
----------------------------------------
When you press "add event," you will go to a new screen where you be prompted to add the details to you events. Some of the details include start time, address, event title, etc.. Once you fill out the details, press the submit button to add it to the map. Assuming you put a valid U.S. address, the event should pop up. (You may have to refresh it you dont see it). 

1.) Press 'Add Event'

2.) Fill out all the boxes.

3.) Press 'Submit'

4.) Refresh the page


