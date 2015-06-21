[![Stories in Ready](https://badge.waffle.io/OpenDirective/brian.png?label=ready&title=Ready)](https://waffle.io/OpenDirective/brian)
# Brian

## Easy communication and media access for people with cognative disabilities.

Brian is designed primarily for users with cognitive disabilities such as early stage dementia and who dislike complexity and distractions. It should also be of use for people with low digital literacy.

Brian provides the user with uncomplicated access to communication and media which is moderated by a carer. A typical use case would be Brian as part of a service enabling a family member to keep in contact with a older person who lives remotely and has low digital literacy and/or early stage dementia. 

For example Brian includes an email client with only the minimum basics provided on screen. Users can easily communicate with a few people. There are also a range of easy to use media players including video.

## User roles
There are 2 main user roles with Brian.

1. The end user accessing the simplified UX on a suitable device such as a tablet.
2. The carer who use a simple interface to configure the user experience and existing communication and media services like gmail or picassa.

## Key features
* End user and carer have different user experiences
* End user accesses communications and media via the friendly and simplified UI of Brian
* The end user interface can can operate at several levels of complexity according to ability and to provide stepping stones
* The carer use existing services like Gmail, Picassa and WebRTC
* A configuration user interface is provided for carers so they can manage the end user experience
* Features include email, video calls, photo viewer, video viewer, music player
* Brian is also a platform for exploring the how to meet the requirements of people with cognative disabilities
* Builds on previous work including [Maavis](http://maavis.fullmeasure.co.uk), EasyOne Communicator and the W3C cognative accessibility task force

## Technical features

The architecture is HTML based clients in collaboration with a web service. Initially the UX is optimised for Desktop and tablet form factors.

* Front-end is HTML, CSS, Javascript (ES5)
* Server is Javascript nodejs and hapi web server
* Client server communication is via RESTful APIs
* Minimal dependency on frameworks, libraries or tooling 
* Workflow using Gulp, browserify
* CommonJS modules

## Our values

### Technical
* Mobile first, responsive, progressively enhanced and accessible
* Minimal dependencies on frameworks etc
* Agile dev - with MCP - minimum compelling product (loved by users)
* Best practices, especially architectural patterns
* Clear roadmap
* Encourage diverse participation
