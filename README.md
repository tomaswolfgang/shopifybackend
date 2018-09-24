Hi!
I'm going to outline the usage for this project

DOCKER method:
after running the docker image
you can see the project at http://localhost:8080 or use your local ip address with port 8080 i.e. 192.168.10.100:3000.
if you install the dependencies for the project ("npm install" at the root) you can run the test scripts via "yarn test-order" and "yarn test-user." 

  
  
LIVE method:
OR you can see the project live at http://35.194.13.235


<USAGE>
This page displays all of the available stores to buy from

clicking into a store will take you to /shop?shop=... ...
and this displays a stores wares (Products)

clicking on a product will navigate you to a page with the product details (price description etc.)
NOTE: you need to be logged in to "purchase any items"

<IF YOU HAVENT MADE AN ACCOUNT

click login from any page (this will navigate you to /login)
from here under the password input there is an option to register.

Once you have gotten to the register page you can create an account
usernames must be between 4 and 30 characters
passwords are encrypted in the database using bcrypt

submit the form to create your user

congrats on becoming a official customer of my application!

IF YOUVE MADE AN ACCOUNT YOU CAN SKIP TO HERE>

As a logged in user, you now have the ability to add products to your cart and view you cart (by clicking the cart link in the top right corner).
Additionally, when viewing your active cart you can remove products as you see fit.
Once you are satisfied with you order you can checkout from the cart page.


All of your checkout details are stored in a order history that you can view by clicking the order history link from the thank you page or the cart page.
