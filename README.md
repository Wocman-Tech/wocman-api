# Wocman Technology Project API

## Node.js(express.js) – JWT Authentication & Authorization, Sequelize(mysql)


### API DOCs
```
https://documenter.getostman.com/view/10053626/TWDcGv7U
&&
https://documenter.getpostman.com/view/10053626/TWDfCt1m
```

### API Resolve
```
https://wocman-node-api-8080.herokuapp.com/
```


### Offline API Resolve
```
http://localhost:8081/

or

http://localhost:3000/

or

https://wocman.netlify.app
```


#Want to work offline ?

### Offline API Settings
```

1.  Open app folder

2.  Open config folder

3.  Open env.config.js file and Set 
```
workstation : "localhost"
```

4.  You may Modify the local db credentials to suite your need in db.config.js file inside the config folder inside the app folder
```


#note:(05/08/2021)


1 modified projects model by setting the defaultValue of country field to 'nigeria'
1 modified projects model by setting the defaultValue of defaultValue field to 'null'
1 modified projects model by adding customerstart field
1 modified projects model by adding projectreport field

2 modified users model by adding featured field name: this would assist to show if user is featured or not
3 modified wocmancustomer model by adding  messagetype and messagelinks field name: this would assist to show if it was a text or media
