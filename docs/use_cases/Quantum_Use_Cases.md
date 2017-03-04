# Quantum Team – CoCo Use Case Discussion

_Notes are based on a meeting with Chris Peterson from Quantum and Kyle Lahnakoski, Joel Maher and Eric Desjardins from Code Coverage_

**List of desired functionality:**
* Ability to compare existing code coverage of Gecko vs. Quantum code coverage
* Periodic check-ins of the code coverage to assess missing areas
* Metrics related to the Quantum code coverage is very desirable
* Line coverage and function coverage would be ideal (both are collected with ActiveData)
* Enumeration of functions covered vs. functions not covered
* Facilitate sharing between developers (e.g. sharable URL to the current page / context specific). Streamline sharing information between developers.
* High-level view of the directories (i.e. parent directories) is good, but should also provide/display child directories.
* The tree view would likely be specific to the user’s needs (filtering functionality)
    * Release management and QA would (potentially) prefer a high-level summary view of the code coverage
    * Developers would likely prefer the ability to view their specific project (fast access)
* It would be important to know what builds on which platform in the UI
    * Example: Build with Rust code turned on (i.e. non-default build)
* For Quantum (likely most projects?), setting the default build to Linux would be the best
* Having the ability to point the code coverage to private repos or moz-central – would it be possible to run a diff on the coverage?
* No need for a programmatic interface, the CoCo UI is enough to provide information to developers


**Additional notes:**
* UI functionality should exist to filter between projects (e.g. Quantum and JavaScript)
* Bug with the current drill up functionality (i.e. back button), there should be an easy way for the user to move up/down levels.
* In response to the periodic check-ins, a cron job would be created to run every night
