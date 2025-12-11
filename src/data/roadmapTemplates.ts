import type { RoadmapResponse } from "@/types/roadmap";

export interface RoadmapTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;
    roadmap: RoadmapResponse;
}

export const roadmapTemplates: RoadmapTemplate[] = [
    {
        id: "frontend-beginner",
        title: "Frontend Developer",
        description: "Pelajari dasar-dasar pengembangan web dengan HTML, CSS, JavaScript, dan React",
        category: "Web Development",
        icon: "🌐",
        difficulty: "beginner",
        estimatedTime: "3-4 bulan",
        roadmap: {
            title: "Frontend Developer Roadmap",
            nodes: [
                {
                    id: "html",
                    label: "HTML Fundamentals",
                    type: "input",
                    category: "core",
                    data: {
                        description: "Pelajari struktur dasar halaman web menggunakan HTML5. Materi mencakup semantic elements, forms, tables, multimedia, dan accessibility basics untuk membangun fondasi web development yang kuat.",
                        resources: [
                            "https://developer.mozilla.org/en-US/docs/Learn/HTML",
                            "https://www.w3schools.com/html/",
                            "https://web.dev/learn/html/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=kUMe1FH4CHE",
                            "https://www.youtube.com/watch?v=pQN-pnXPaVg",
                            "https://www.youtube.com/watch?v=qz0aGYrrlhU"
                        ]
                    }
                },
                {
                    id: "css",
                    label: "CSS & Styling",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kuasai CSS untuk membuat tampilan web yang menarik. Pelajari selectors, box model, Flexbox, Grid, animations, dan CSS modern. Termasuk best practices untuk maintainable stylesheets.",
                        resources: [
                            "https://developer.mozilla.org/en-US/docs/Learn/CSS",
                            "https://css-tricks.com/",
                            "https://web.dev/learn/css/",
                            "https://flexboxfroggy.com/",
                            "https://cssgridgarden.com/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
                            "https://www.youtube.com/watch?v=phWxA89Dy94",
                            "https://www.youtube.com/watch?v=rg7Fvvl3taU",
                            "https://www.youtube.com/watch?v=9zBsdzdE4sM"
                        ]
                    }
                },
                {
                    id: "js-basics",
                    label: "JavaScript Basics",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Pelajari JavaScript untuk menambahkan interaktivitas pada website. Materi: variables, data types, functions, DOM manipulation, events, async/await, dan ES6+ features.",
                        resources: [
                            "https://javascript.info/",
                            "https://developer.mozilla.org/en-US/docs/Learn/JavaScript",
                            "https://eloquentjavascript.net/",
                            "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                            "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                            "https://www.youtube.com/watch?v=W6NZfCO5SIk",
                            "https://www.youtube.com/watch?v=lkIFF4maKMU"
                        ]
                    }
                },
                {
                    id: "responsive",
                    label: "Responsive Design",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Buat website yang tampil sempurna di semua ukuran layar. Pelajari media queries, mobile-first approach, fluid layouts, dan responsive images.",
                        resources: [
                            "https://web.dev/responsive-web-design-basics/",
                            "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
                            "https://www.freecodecamp.org/news/responsive-web-design-how-to-make-a-website-look-good-on-phones-and-tablets/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=srvUrASNj0s",
                            "https://www.youtube.com/watch?v=yU7jJ3NbPdA",
                            "https://www.youtube.com/watch?v=K24lUqcT0Ms"
                        ]
                    }
                },
                {
                    id: "git",
                    label: "Git & GitHub",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kuasai version control dengan Git dan kolaborasi dengan GitHub. Pelajari commits, branches, merging, pull requests, dan workflow profesional.",
                        resources: [
                            "https://git-scm.com/book/en/v2",
                            "https://docs.github.com/en/get-started",
                            "https://learngitbranching.js.org/",
                            "https://www.atlassian.com/git/tutorials"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=RGOj5yH7evk",
                            "https://www.youtube.com/watch?v=8JJ101D3knE",
                            "https://www.youtube.com/watch?v=HkdAHXoRtos",
                            "https://www.youtube.com/watch?v=Uszj_k0DGsg"
                        ]
                    }
                },
                {
                    id: "react",
                    label: "React.js",
                    type: "default",
                    category: "advanced",
                    data: {
                        description: "Bangun user interface modern dengan React. Pelajari components, props, state, hooks (useState, useEffect), context, dan React ecosystem.",
                        resources: [
                            "https://react.dev/learn",
                            "https://www.freecodecamp.org/news/react-tutorial-learn-react-basics/",
                            "https://github.com/enaqx/awesome-react"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=bMknfKXIFA8",
                            "https://www.youtube.com/watch?v=CgkZ7MvWUAA",
                            "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
                            "https://www.youtube.com/watch?v=SqcY0GlETPk"
                        ]
                    }
                },
                {
                    id: "tailwind",
                    label: "Tailwind CSS",
                    type: "default",
                    category: "optional",
                    data: {
                        description: "Percepat development dengan Tailwind CSS utility-first framework. Pelajari utility classes, responsive design, customization, dan component patterns.",
                        resources: [
                            "https://tailwindcss.com/docs",
                            "https://tailwindui.com/",
                            "https://www.youtube.com/c/TailwindLabs"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=UBOj6rqRUME",
                            "https://www.youtube.com/watch?v=dFgzHOX84xQ",
                            "https://www.youtube.com/watch?v=pfaSUYaSgRo"
                        ]
                    }
                },
                {
                    id: "project",
                    label: "Portfolio Project",
                    type: "output",
                    category: "project",
                    data: {
                        description: "Bangun website portfolio profesional yang menampilkan skill dan proyek kamu. Implementasikan semua yang sudah dipelajari: responsive design, React components, dan styling modern.",
                        resources: [
                            "https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio-website/",
                            "https://github.com/emmabostian/developer-portfolios",
                            "https://www.frontendmentor.io/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=ldwlOzRvYOU",
                            "https://www.youtube.com/watch?v=OPaLnMw2i_0"
                        ]
                    }
                },
            ],
            edges: [
                { id: "e1", source: "html", target: "css" },
                { id: "e2", source: "css", target: "js-basics" },
                { id: "e3", source: "css", target: "responsive" },
                { id: "e4", source: "js-basics", target: "git" },
                { id: "e5", source: "js-basics", target: "react" },
                { id: "e6", source: "responsive", target: "tailwind", edgeType: "branch" },
                { id: "e7", source: "react", target: "project" },
                { id: "e8", source: "tailwind", target: "project", edgeType: "branch" },
            ],
        },
    },
    {
        id: "backend-beginner",
        title: "Backend Developer",
        description: "Kuasai pengembangan server-side dengan Node.js, Express, dan database",
        category: "Web Development",
        icon: "⚙️",
        difficulty: "beginner",
        estimatedTime: "4-5 bulan",
        roadmap: {
            title: "Backend Developer Roadmap",
            nodes: [
                {
                    id: "js-basics",
                    label: "JavaScript & ES6+",
                    type: "input",
                    category: "core",
                    data: {
                        description: "Kuasai JavaScript modern sebagai fondasi untuk Node.js. Pelajari ES6+ features: arrow functions, destructuring, modules, promises, async/await, dan class syntax.",
                        resources: [
                            "https://javascript.info/",
                            "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                            "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                            "https://www.youtube.com/watch?v=NCwa_xi0Uuc",
                            "https://www.youtube.com/watch?v=DHjqpvDnNGE"
                        ]
                    }
                },
                {
                    id: "nodejs",
                    label: "Node.js Runtime",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Pelajari Node.js untuk menjalankan JavaScript di server. Materi: event loop, modules, file system, streams, dan npm package management.",
                        resources: [
                            "https://nodejs.org/en/docs/",
                            "https://nodejs.dev/learn",
                            "https://www.freecodecamp.org/news/introduction-to-nodejs/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=TlB_eWDSMt4",
                            "https://www.youtube.com/watch?v=Oe421EPjeBE",
                            "https://www.youtube.com/watch?v=fBNz5xF-Kx4"
                        ]
                    }
                },
                {
                    id: "express",
                    label: "Express.js Framework",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Bangun web server dengan Express.js. Pelajari routing, middleware, request/response handling, error handling, dan template engines.",
                        resources: [
                            "https://expressjs.com/en/guide/routing.html",
                            "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs",
                            "https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=L72fhGm1tfE",
                            "https://www.youtube.com/watch?v=SccSCuHhOw0",
                            "https://www.youtube.com/watch?v=lY6icfhap2o"
                        ]
                    }
                },
                {
                    id: "sql",
                    label: "SQL & PostgreSQL",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kuasai relational database dengan PostgreSQL. Pelajari SQL queries, joins, indexing, transactions, dan database design principles.",
                        resources: [
                            "https://www.postgresql.org/docs/",
                            "https://sqlbolt.com/",
                            "https://www.postgresqltutorial.com/",
                            "https://www.prisma.io/docs/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=qw--VYLpxG4",
                            "https://www.youtube.com/watch?v=SpfIwlAYaKk",
                            "https://www.youtube.com/watch?v=HXV3zeQKqGY"
                        ]
                    }
                },
                {
                    id: "mongodb",
                    label: "MongoDB (NoSQL)",
                    type: "default",
                    category: "optional",
                    data: {
                        description: "Pelajari NoSQL database dengan MongoDB. Materi: documents, collections, CRUD operations, aggregation, indexing, dan Mongoose ODM.",
                        resources: [
                            "https://docs.mongodb.com/manual/",
                            "https://university.mongodb.com/",
                            "https://mongoosejs.com/docs/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=ExcRbA7fy_A",
                            "https://www.youtube.com/watch?v=J6mDkcqU_ZE",
                            "https://www.youtube.com/watch?v=-56x56UppqQ"
                        ]
                    }
                },
                {
                    id: "auth",
                    label: "Authentication & Security",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Implementasikan user authentication yang aman. Pelajari password hashing (bcrypt), JWT tokens, OAuth, sessions, dan security best practices.",
                        resources: [
                            "https://jwt.io/introduction",
                            "https://owasp.org/www-project-web-security-testing-guide/",
                            "https://auth0.com/learn/",
                            "https://cheatsheetseries.owasp.org/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=mbsmsi7l3r4",
                            "https://www.youtube.com/watch?v=T0k-3Ze4NLo",
                            "https://www.youtube.com/watch?v=2PPSXonhIck"
                        ]
                    }
                },
                {
                    id: "rest-api",
                    label: "REST API Design",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Design dan build RESTful APIs yang scalable. Pelajari HTTP methods, status codes, API versioning, documentation (Swagger), dan best practices.",
                        resources: [
                            "https://restfulapi.net/",
                            "https://swagger.io/docs/specification/about/",
                            "https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=-MTSQjw5DrM",
                            "https://www.youtube.com/watch?v=fgTGADljAeg",
                            "https://www.youtube.com/watch?v=0oXYLzuucwE"
                        ]
                    }
                },
                {
                    id: "project",
                    label: "Full REST API Project",
                    type: "output",
                    category: "project",
                    data: {
                        description: "Bangun REST API lengkap dengan authentication, CRUD operations, dan database integration. Contoh: Blog API, E-commerce API, atau Task Management API.",
                        resources: [
                            "https://github.com/gothinkster/realworld",
                            "https://www.freecodecamp.org/news/building-a-simple-crud-application-with-express-and-mongodb-63f80f3eb1cd/",
                            "https://blog.postman.com/how-to-build-an-api/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=l8WPWK9mS5M",
                            "https://www.youtube.com/watch?v=0D5EEKH97NA"
                        ]
                    }
                },
            ],
            edges: [
                { id: "e1", source: "js-basics", target: "nodejs" },
                { id: "e2", source: "nodejs", target: "express" },
                { id: "e3", source: "express", target: "sql" },
                { id: "e4", source: "express", target: "mongodb", edgeType: "branch" },
                { id: "e5", source: "sql", target: "auth" },
                { id: "e6", source: "auth", target: "rest-api" },
                { id: "e7", source: "rest-api", target: "project" },
            ],
        },
    },
    {
        id: "python-data",
        title: "Python untuk Data Science",
        description: "Pelajari Python dan analisis data dari dasar hingga machine learning",
        category: "Data Science",
        icon: "📊",
        difficulty: "beginner",
        estimatedTime: "3-4 bulan",
        roadmap: {
            title: "Python Data Science Roadmap",
            nodes: [
                {
                    id: "python-basics",
                    label: "Python Fundamentals",
                    type: "input",
                    category: "core",
                    data: {
                        description: "Kuasai dasar-dasar Python: syntax, data types, control flow, functions, OOP, file handling, dan virtual environments. Fondasi penting untuk data science.",
                        resources: [
                            "https://docs.python.org/3/tutorial/",
                            "https://www.learnpython.org/",
                            "https://automatetheboringstuff.com/",
                            "https://realpython.com/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                            "https://www.youtube.com/watch?v=rfscVS0vtbw",
                            "https://www.youtube.com/watch?v=XKHEtdqhLK8"
                        ]
                    }
                },
                {
                    id: "numpy",
                    label: "NumPy",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Pelajari NumPy untuk numerical computing. Materi: arrays, broadcasting, vectorization, linear algebra, dan mathematical operations untuk data manipulation yang efisien.",
                        resources: [
                            "https://numpy.org/doc/stable/user/quickstart.html",
                            "https://numpy.org/doc/stable/user/absolute_beginners.html",
                            "https://www.w3schools.com/python/numpy/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=QUT1VHiLmmI",
                            "https://www.youtube.com/watch?v=GB9ByFAIAH4",
                            "https://www.youtube.com/watch?v=8Y0qQEh7dJg"
                        ]
                    }
                },
                {
                    id: "pandas",
                    label: "Pandas",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kuasai Pandas untuk data manipulation dan analysis. Pelajari DataFrames, Series, data cleaning, merging, groupby, pivot tables, dan handling missing data.",
                        resources: [
                            "https://pandas.pydata.org/docs/getting_started/",
                            "https://www.kaggle.com/learn/pandas",
                            "https://www.datacamp.com/tutorial/pandas"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=vmEHCJofslg",
                            "https://www.youtube.com/watch?v=ZyhVh-qRZPA",
                            "https://www.youtube.com/watch?v=e60ItwlZTKM"
                        ]
                    }
                },
                {
                    id: "matplotlib",
                    label: "Data Visualization",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Buat visualisasi data yang informatif dengan Matplotlib dan Seaborn. Pelajari berbagai chart types, customization, dan storytelling dengan data.",
                        resources: [
                            "https://matplotlib.org/stable/tutorials/index.html",
                            "https://seaborn.pydata.org/tutorial.html",
                            "https://www.python-graph-gallery.com/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=UO98lJQ3QGI",
                            "https://www.youtube.com/watch?v=a9UrKTVEeZA",
                            "https://www.youtube.com/watch?v=GGL6U0k8WYA"
                        ]
                    }
                },
                {
                    id: "statistics",
                    label: "Statistics & Probability",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Pelajari konsep statistik fundamental: descriptive statistics, probability distributions, hypothesis testing, correlation, dan regression analysis.",
                        resources: [
                            "https://www.khanacademy.org/math/statistics-probability",
                            "https://www.statlearning.com/",
                            "https://seeing-theory.brown.edu/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=xxpc-HPKN28",
                            "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNM_Y-bUAhblSAdWRnmBUcr",
                            "https://www.youtube.com/watch?v=zouPoc49xbk"
                        ]
                    }
                },
                {
                    id: "sklearn",
                    label: "Machine Learning Basics",
                    type: "default",
                    category: "advanced",
                    data: {
                        description: "Mulai machine learning dengan Scikit-learn. Pelajari supervised/unsupervised learning, model evaluation, cross-validation, dan common algorithms.",
                        resources: [
                            "https://scikit-learn.org/stable/tutorial/",
                            "https://www.kaggle.com/learn/intro-to-machine-learning",
                            "https://machinelearningmastery.com/start-here/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=7eh4d6sabA0",
                            "https://www.youtube.com/watch?v=pqNCD_5r0IU",
                            "https://www.youtube.com/watch?v=JcI5Vnw0b2c"
                        ]
                    }
                },
                {
                    id: "project",
                    label: "Data Analysis Project",
                    type: "output",
                    category: "project",
                    data: {
                        description: "Analisis dataset nyata end-to-end: data cleaning, EDA, visualization, dan insights. Gunakan dataset dari Kaggle atau data publik Indonesia.",
                        resources: [
                            "https://www.kaggle.com/datasets",
                            "https://data.go.id/",
                            "https://github.com/awesomedata/awesome-public-datasets"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=r-uOLxNrNk8",
                            "https://www.youtube.com/watch?v=HXV3zeQKqGY"
                        ]
                    }
                },
            ],
            edges: [
                { id: "e1", source: "python-basics", target: "numpy" },
                { id: "e2", source: "numpy", target: "pandas" },
                { id: "e3", source: "pandas", target: "matplotlib" },
                { id: "e4", source: "pandas", target: "statistics" },
                { id: "e5", source: "matplotlib", target: "sklearn" },
                { id: "e6", source: "statistics", target: "sklearn" },
                { id: "e7", source: "sklearn", target: "project" },
            ],
        },
    },
    {
        id: "mobile-react-native",
        title: "Mobile App Development",
        description: "Bangun aplikasi mobile cross-platform dengan React Native dan Expo",
        category: "Mobile Development",
        icon: "📱",
        difficulty: "intermediate",
        estimatedTime: "4-5 bulan",
        roadmap: {
            title: "React Native Roadmap",
            nodes: [
                {
                    id: "js",
                    label: "JavaScript & ES6+",
                    type: "input",
                    category: "core",
                    data: {
                        description: "Kuasai JavaScript modern yang essential untuk React Native: arrow functions, destructuring, spread operator, async/await, modules, dan class syntax.",
                        resources: [
                            "https://javascript.info/",
                            "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                            "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                            "https://www.youtube.com/watch?v=NCwa_xi0Uuc",
                            "https://www.youtube.com/watch?v=PkZNo7MFNFg"
                        ]
                    }
                },
                {
                    id: "react",
                    label: "React Fundamentals",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Pelajari React basics sebelum React Native: components, JSX, props, state, hooks (useState, useEffect, useContext), dan component lifecycle.",
                        resources: [
                            "https://react.dev/learn",
                            "https://www.freecodecamp.org/news/react-beginners-guide/",
                            "https://github.com/enaqx/awesome-react"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=bMknfKXIFA8",
                            "https://www.youtube.com/watch?v=CgkZ7MvWUAA",
                            "https://www.youtube.com/watch?v=SqcY0GlETPk"
                        ]
                    }
                },
                {
                    id: "rn-basics",
                    label: "React Native & Expo",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Mulai mobile development dengan React Native dan Expo. Pelajari core components (View, Text, Image, ScrollView), styling, dan Expo workflow.",
                        resources: [
                            "https://reactnative.dev/docs/getting-started",
                            "https://docs.expo.dev/",
                            "https://www.reactnative.express/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=0-S5a0eXPoc",
                            "https://www.youtube.com/watch?v=obH0Po_RdWk",
                            "https://www.youtube.com/watch?v=VozPNrt-LfE"
                        ]
                    }
                },
                {
                    id: "navigation",
                    label: "Navigation",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Implementasikan navigasi dengan React Navigation. Pelajari stack, tab, drawer navigation, deep linking, dan navigation state management.",
                        resources: [
                            "https://reactnavigation.org/docs/getting-started",
                            "https://reactnavigation.org/docs/navigation-container",
                            "https://expo.dev/go"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=npe3Wf4tpSg",
                            "https://www.youtube.com/watch?v=bnEmQ3AM40A",
                            "https://www.youtube.com/watch?v=0dCGJnGkOUI"
                        ]
                    }
                },
                {
                    id: "state",
                    label: "State Management",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kelola application state dengan berbagai pendekatan: Context API, Zustand, Redux Toolkit, atau React Query untuk server state.",
                        resources: [
                            "https://zustand-demo.pmnd.rs/",
                            "https://redux-toolkit.js.org/",
                            "https://tanstack.com/query/latest",
                            "https://react.dev/learn/managing-state"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=5-1LM2NySR0",
                            "https://www.youtube.com/watch?v=eFh2Kr9hfyo",
                            "https://www.youtube.com/watch?v=P9k68r8OBpI"
                        ]
                    }
                },
                {
                    id: "native-modules",
                    label: "Native Features",
                    type: "default",
                    category: "advanced",
                    data: {
                        description: "Akses fitur native device: camera, location, notifications, storage, dan sensors. Pelajari Expo modules dan native module integration.",
                        resources: [
                            "https://docs.expo.dev/versions/latest/",
                            "https://reactnative.dev/docs/native-modules-intro",
                            "https://www.notjust.dev/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=wUDeLT6WXnQ",
                            "https://www.youtube.com/watch?v=ONAVmsGW6-M",
                            "https://www.youtube.com/watch?v=rnj0_M6m9Zc"
                        ]
                    }
                },
                {
                    id: "project",
                    label: "Mobile App Project",
                    type: "output",
                    category: "project",
                    data: {
                        description: "Bangun aplikasi mobile lengkap: UI/UX, navigation, state management, dan API integration. Contoh: Todo App, Weather App, atau Social Media Clone.",
                        resources: [
                            "https://www.notjust.dev/projects",
                            "https://github.com/jondot/awesome-react-native",
                            "https://www.youtube.com/@notjustdev"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=0kL6nhutjQ8",
                            "https://www.youtube.com/watch?v=mJ3bGvy0WAY"
                        ]
                    }
                },
            ],
            edges: [
                { id: "e1", source: "js", target: "react" },
                { id: "e2", source: "react", target: "rn-basics" },
                { id: "e3", source: "rn-basics", target: "navigation" },
                { id: "e4", source: "rn-basics", target: "state" },
                { id: "e5", source: "navigation", target: "native-modules" },
                { id: "e6", source: "state", target: "project" },
                { id: "e7", source: "native-modules", target: "project", edgeType: "branch" },
            ],
        },
    },
    {
        id: "ui-ux-design",
        title: "UI/UX Design Fundamentals",
        description: "Pelajari dasar-dasar desain user interface dan user experience",
        category: "Design",
        icon: "🎨",
        difficulty: "beginner",
        estimatedTime: "2-3 bulan",
        roadmap: {
            title: "UI/UX Design Roadmap",
            nodes: [
                {
                    id: "design-principles",
                    label: "Design Principles",
                    type: "input",
                    category: "core",
                    data: {
                        description: "Pelajari prinsip dasar desain: hierarchy, contrast, alignment, repetition, proximity, dan balance. Fondasi untuk semua desain visual.",
                        resources: [
                            "https://www.interaction-design.org/literature/topics/design-principles",
                            "https://www.nngroup.com/articles/ten-usability-heuristics/",
                            "https://lawsofux.com/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=yNDgFK2Jj1E",
                            "https://www.youtube.com/watch?v=74P7GZsNJH8",
                            "https://www.youtube.com/watch?v=MELKuexR3sQ"
                        ]
                    }
                },
                {
                    id: "color-typography",
                    label: "Color & Typography",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kuasai teori warna dan tipografi untuk UI design. Pelajari color psychology, color schemes, font pairing, dan readability principles.",
                        resources: [
                            "https://color.adobe.com/",
                            "https://coolors.co/",
                            "https://fonts.google.com/",
                            "https://typescale.com/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=Qj1FK8n7WgY",
                            "https://www.youtube.com/watch?v=sByzHoiYFX0",
                            "https://www.youtube.com/watch?v=agOdP2Bmieg"
                        ]
                    }
                },
                {
                    id: "figma",
                    label: "Figma Mastery",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Kuasai Figma sebagai design tool utama. Pelajari frames, components, auto-layout, variants, prototyping, dan collaboration features.",
                        resources: [
                            "https://help.figma.com/hc/en-us",
                            "https://www.figma.com/community",
                            "https://www.youtube.com/c/Figmadesign"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
                            "https://www.youtube.com/watch?v=jwCmIBJ8Jtc",
                            "https://www.youtube.com/watch?v=II-6dDzc-80"
                        ]
                    }
                },
                {
                    id: "ux-research",
                    label: "UX Research Basics",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Pelajari metode UX research: user interviews, surveys, usability testing, persona creation, dan user journey mapping.",
                        resources: [
                            "https://www.nngroup.com/articles/",
                            "https://uxplanet.org/",
                            "https://www.usability.gov/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=TyDsZGn1Fas",
                            "https://www.youtube.com/watch?v=HS6HMnuWDAg",
                            "https://www.youtube.com/watch?v=0YL0xoSmyZI"
                        ]
                    }
                },
                {
                    id: "wireframing",
                    label: "Wireframing & Prototyping",
                    type: "default",
                    category: "core",
                    data: {
                        description: "Buat wireframes dan prototypes interaktif. Pelajari low-fidelity to high-fidelity design process dan user testing dengan prototypes.",
                        resources: [
                            "https://www.figma.com/blog/how-to-wireframe/",
                            "https://balsamiq.com/learn/",
                            "https://www.invisionapp.com/defined/prototype"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=qpH7-KFWZRI",
                            "https://www.youtube.com/watch?v=NB1mn2YVF8Q",
                            "https://www.youtube.com/watch?v=KnZrypOaVCg"
                        ]
                    }
                },
                {
                    id: "design-system",
                    label: "Design Systems",
                    type: "default",
                    category: "advanced",
                    data: {
                        description: "Bangun dan maintain design system yang scalable. Pelajari component libraries, style guides, documentation, dan design tokens.",
                        resources: [
                            "https://www.designsystems.com/",
                            "https://material.io/design",
                            "https://atlassian.design/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=EK-pHkc5EL4",
                            "https://www.youtube.com/watch?v=wc5krC28ynQ",
                            "https://www.youtube.com/watch?v=Dtd40cHQQlk"
                        ]
                    }
                },
                {
                    id: "project",
                    label: "Design Portfolio Project",
                    type: "output",
                    category: "project",
                    data: {
                        description: "Design aplikasi lengkap dari research hingga high-fidelity prototype. Dokumentasikan design process untuk portfolio.",
                        resources: [
                            "https://www.behance.net/",
                            "https://dribbble.com/",
                            "https://www.casestudy.club/"
                        ],
                        videos: [
                            "https://www.youtube.com/watch?v=RYDiDpW2VkM",
                            "https://www.youtube.com/watch?v=vhVj0Xy_Rbs"
                        ]
                    }
                },
            ],
            edges: [
                { id: "e1", source: "design-principles", target: "color-typography" },
                { id: "e2", source: "color-typography", target: "figma" },
                { id: "e3", source: "design-principles", target: "ux-research" },
                { id: "e4", source: "figma", target: "wireframing" },
                { id: "e5", source: "ux-research", target: "wireframing" },
                { id: "e6", source: "wireframing", target: "design-system" },
                { id: "e7", source: "design-system", target: "project" },
            ],
        },
    },
];

export function getTemplateById(id: string): RoadmapTemplate | undefined {
    return roadmapTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): RoadmapTemplate[] {
    return roadmapTemplates.filter(t => t.category === category);
}

export function getAllCategories(): string[] {
    return [...new Set(roadmapTemplates.map(t => t.category))];
}
