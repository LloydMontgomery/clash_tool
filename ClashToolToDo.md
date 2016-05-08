# Clash Tool

## Back-End Promise Re-Structure

### API Calls to be Re-written

* POST /clans
* PUT /clans/join/:clan_ref
* GET /partialUsers
* PUT /wars/:war_id
* GET /users/profile/:username
* GET /users
* GET /users/:user_id
* PUT /users/:user_id
* DELETE /users/:user_id


## Data-Model Structure

### Creation of Proper Data Models

ClanFactory, WarFactory, and UserFactory all need to be finished up to reflect proper classes. This process is slow, however, because I need to check against the pages that use these classes.

### Use of Proper Data Models

Go through each controller, looking for places that data is being used, and try to wrap that functionality/data into one of the three existing data models.


## General Clean-Up Notes

### Re-Structure of Back-End Permissions

Now that the application has been ported over to a more general application, the backend needs to be re-structured to handle the permissions properly. Go over all the API calls after they have been cleaned up and switched over to the new extracted-promise format. This process is going to involve considering the permissions attached to each API call, layering them from weakest to stronger permissions required, changing the order they are in to relfect these changes, and finally put the middleware in place to check user permissions between the layers of api calls.

### Font-End Routing

Currently, the routing is done in the Main controller via a series of if statements, checking different permissions as it goes. I would like to first, decide what the actual order of these permissions is (perhaps draw a flow chart of user-accessable pages and appropriate redirects), followed by implementing a more robust way of doing these checks. I would like the implementation to be easily changed in the future as well, if I add more pages or a different type of permission.

### Front-End PC Styling (Time Permitting)



### Data-Binding Re-Write (Time Permitting)

The backend still has to do some gross cleaning of the war object because of the way I have bound it in Angular. This may or may not have a fix, let's see about implementing that fix.



