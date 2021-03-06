const chalk = require('chalk');
const glob = require('glob');

const semver = require('semver');

const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const _ = require('lodash');

const fs = require('fs');
const packagejs = require('../../package.json');

const filePath = '.yo-rc.json';
const generatorJh = 'generator-jhipster';
const otherModulesName = 'otherModules';
const pn = {
    name: packagejs.name,
    version: packagejs.version
};

const BaseGenerator = require('../common');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                this.registerPrettierTransform();
                this.abort = false;
                this.log();
                this.log(
                    `${chalk.blue.bold('args = ')} ${JSON.stringify(args)}\n`
                );

                const data = fs.existsSync(filePath)
                    ? fs.readFileSync(filePath, { flag: 'r' })
                    : null;

                if (data) {
                    const json = JSON.parse(data);
                    const jh = json[generatorJh];
                    this.log(
                        `${chalk.blue.bold(
                            'App generator_jh: '
                        )} ${JSON.stringify(jh)}\n`
                    );
                    const otherModules = jh[otherModulesName] || [];
                    const oldPn = otherModules.find((e) => e.name === pn.name);
                    if (oldPn) {
                        oldPn.version = pn.version;
                        this.abort = true;
                        this.error('Converter already installed!');
                    } else {
                        otherModules.push(pn);
                    }

                    this.log(
                        `${chalk.blue.bold('otherModules: ')} ${JSON.stringify(
                            otherModules
                        )}\n`
                    );
                    json[generatorJh][otherModulesName] = otherModules;
                    fs.unlinkSync(filePath);
                    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), {
                        encoding: 'utf8',
                        flag: 'w+'
                    });
                }

                this.log(`${chalk.blue.bold('Entity!')} Init complete...\n`);
            },

            readConfig() {
                if (this.abort) {
                    return;
                }
                this.jhAppConfig = this.getAllJhipsterConfig();

                if (!this.jhAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }

                this.log(
                    `${chalk.blue.bold('App!')} Read Config complete...\n`
                );
            },

            checkDBType() {
                if (this.abort) {
                    return;
                }
                if (this.jhAppConfig.databaseType !== 'sql') {
                    // exit if DB type is not SQL
                    this.abort = true;
                }
                this.log(`${chalk.blue.bold('App!')} Check DB complete...\n`);
            },

            displayLogo() {
                this.printConverterLogo();
            },

            checkJHVersion() {
                if (this.abort) {
                    return;
                }
                const { jhipsterVersion } = this.jhAppConfig;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (
                    !semver.satisfies(jhipsterVersion, minimumJhipsterVersion)
                ) {
                    this.warning(
                        `\nYour generated project used an old JHipster version (${jhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`
                    );
                }

                this.log(
                    `${chalk.blue.bold('App!')} Check JH Version complete...\n`
                );
            }
        };
    }

    prompting() {
        if (this.abort) {
            return;
        }
        const prompts = [];
        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    }

    get writing() {
        return {
            // updateYeomanConfig() {
            //     if (this.abort) {
            //
            //     }
            //     // this.config.set('promptValues', pn);
            // },

            setupGlobalVar() {
                if (this.abort) {
                    return;
                }
                // read config from .yo-rc.json
                this.baseName = this.jhAppConfig.baseName;
                this.packageName = this.jhAppConfig.packageName;
                this.buildTool = this.jhAppConfig.buildTool;
                this.databaseType = this.jhAppConfig.databaseType;
                this.devDatabaseType = this.jhAppConfig.devDatabaseType;
                this.prodDatabaseType = this.jhAppConfig.prodDatabaseType;
                this.enableTranslation = this.jhAppConfig.enableTranslation;
                this.languages = this.jhAppConfig.languages;
                this.clientFramework = this.jhAppConfig.clientFramework;
                this.hibernateCache = this.jhAppConfig.hibernateCache;
                this.packageFolder = this.jhAppConfig.packageFolder;
                this.clientPackageManager = this.jhAppConfig.clientPackageManager;
                this.cacheProvider = this.jhAppConfig.cacheProvider;
                this.skipFakeData = this.jhAppConfig.skipFakeData;
                this.skipServer = this.jhAppConfig.skipServer;
                this.skipClient = this.jhAppConfig.skipClient;

                // use function in generator-base.js from generator-jhipster
                this.angularAppName = this.getAngularAppName();
                this.angularXAppName = this.getAngularXAppName();
                this.changelogDate = this.dateFormatForLiquibase();
                this.jhiPrefix = this.jhAppConfig.jhiPrefix;
                this.jhiPrefixDashed = _.kebabCase(this.jhiPrefix);
                this.jhiTablePrefix = this.getTableName(this.jhiPrefix);

                // use constants from generator-constants.js
                this.webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;
                this.javaTemplateDir = 'src/main/java/package';
                this.javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR
                    + this.packageFolder}/`;
                this.resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
                this.interpolateRegex = jhipsterConstants.INTERPOLATE_REGEX;
                this.javaTestDir = `${jhipsterConstants.SERVER_TEST_SRC_DIR
                    + this.packageFolder}/`;

                // variable from questions
                this.message = this.props.message;

                this.log(
                    `${chalk.blue.bold('App!')} Setup Global Var complete...\n`
                );
            },

            writeBaseFiles() {
                if (this.abort) {
                    return;
                }
                const { javaDir } = this;
                const { javaTestDir } = this;
                const { webappDir } = this;
                const { resourceDir } = this;

                // show all variables
                this.log('\n--- some config read from config ---');
                this.log(`baseName=${this.baseName}`);
                this.log(`packageName=${this.packageName}`);
                this.log(`clientFramework=${this.clientFramework}`);
                this.log(`clientPackageManager=${this.clientPackageManager}`);
                this.log(`buildTool=${this.buildTool}`);

                this.log('\n--- some function ---');
                this.log(`angularAppName=${this.angularAppName}`);

                this.log('\n--- some const ---');
                this.log(`javaDir=${javaDir}`);
                this.log(`resourceDir=${resourceDir}`);
                this.log(`webappDir=${webappDir}`);

                this.log('\n--- variables from questions ---');
                this.log(`\nmessage=${this.message}`);
                this.log('------\n');

                // Convert Code here
                this.convertIDtoUUIDForColumn(
                    `${javaDir}domain/User.java`,
                    '',
                    'id'
                );
                this.convertIDtoUUIDForColumn(
                    `${javaDir}domain/PersistentAuditEvent.java`,
                    '',
                    'event_id'
                );

                // And the Repository
                this.longToUUID(`${javaDir}repository/UserRepository.java`);
                this.longToUUID(
                    `${javaDir}repository/PersistenceAuditEventRepository.java`
                );

                // And the Service
                this.longToUUID(`${javaDir}service/AuditEventService.java`);
                this.replaceContent(
                    `${javaDir}service/UserService.java`,
                    'getUserWithAuthorities(Long id)',
                    'getUserWithAuthorities(String id)'
                );
                this.importUUID(`${javaDir}service/mapper/UserMapper.java`);
                this.replaceContent(
                    `${javaDir}service/mapper/UserMapper.java`,
                    'userFromId(Long id)',
                    'userFromId(String id)'
                );
                this.longToUUID(`${javaDir}service/mapper/UserMapper.java`);
                this.longToUUID(`${javaDir}service/UserService.java`);

                // And the Web
                this.importUUID(`${javaDir}web/rest/AuditResource.java`);
                this.replaceContent(
                    `${javaDir}web/rest/AuditResource.java`,
                    'get(@PathVariable Long id)',
                    'get(@PathVariable String id)'
                );
                this.longToUUID(`${javaDir}web/rest/vm/ManagedUserVM.java`);
                this.longToUUID(`${javaDir}service/dto/UserDTO.java`);

                // Tests
                this.replaceContent(
                    `${javaTestDir}web/rest/UserResourceIT.java`,
                    'Long',
                    'String',
                    'true'
                );

                this.replaceContent(
                    `${javaTestDir}web/rest/UserResourceIT.java`,
                    '1L',
                    '"00000000-0000-0000-0000-000000000001"',
                    'true'
                );
                this.replaceContent(
                    `${javaTestDir}web/rest/UserResourceIT.java`,
                    '2L',
                    '"00000000-0000-0000-0000-000000000002"',
                    'true'
                );

                this.importUUID(`${javaTestDir}web/rest/AuditResourceIT.java`);
                this.replaceContent(
                    `${javaTestDir}web/rest/AuditResourceIT.java`,
                    '1L',
                    '"00000000-0000-0000-0000-000000000001"',
                    'true'
                );
                this.replaceContent(
                    `${javaTestDir}web/rest/AuditResourceIT.java`,
                    '2L',
                    '"00000000-0000-0000-0000-000000000002"',
                    'true'
                );

                this.longToUUID(
                    `${javaTestDir}service/mapper/UserMapperTest.java`
                );
                this.replaceContent(
                    `${javaTestDir}service/mapper/UserMapperTest.java`,
                    '1L',
                    '"00000000-0000-0000-0000-000000000001"',
                    'true'
                );

                const file = glob.sync(
                    'src/main/resources/config/liquibase/changelog/*initial_schema.xml'
                )[0];

                this.replaceContent(
                    file,
                    'type="bigint"',
                    'type="varchar(255)"',
                    'true'
                );
                this.replaceContent(
                    file,
                    'type="BIGINT"',
                    'type="varchar(255)"',
                    'true'
                );
                this.replaceContent(
                    file,
                    'type="numeric"',
                    'type="string"',
                    'true'
                );
                this.replaceContent(
                    file,
                    'autoIncrement="\\$\\{autoIncrement\\}"',
                    '',
                    'true'
                );

                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user.csv',
                    '1;',
                    '8d9b707a-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );
                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user.csv',
                    '2;',
                    '8d9b7412-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );
                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user.csv',
                    '3;',
                    '8d9b77f0-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );
                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user.csv',
                    '4;',
                    '8d9b79c6-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );

                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user_authority.csv',
                    '1;',
                    '8d9b707a-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );
                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user_authority.csv',
                    '3;',
                    '8d9b77f0-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );
                this.replaceContent(
                    'src/main/resources/config/liquibase/data/user_authority.csv',
                    '4;',
                    '8d9b79c6-ddf4-11e5-b86d-9a79f06e9478;',
                    'true'
                );

                this.log(
                    `${chalk.blue.bold(
                        'App!'
                    )} Update of core files complete...\n`
                );
            },

            updateFiles() {
                this.log(
                    `${chalk.blue.bold('App!')} Update files complete...\n`
                );
            },

            writeFiles() {
                this.log(
                    `${chalk.blue.bold('App!')} Write files complete...\n`
                );
            },

            updateEntityFiles() {
                this.log(
                    `${chalk.blue.bold(
                        'App!'
                    )} Update Entity files complete...\n`
                );
            },

            registering() {
                if (this.abort) {
                    return;
                }
                // Register this generator as a dev dependency
                // this.addNpmDevDependency('generator-jhipster-mysql-uuid-converter', packagejs.version);

                // this.addNpmDevDependency('generator-jhipster-mysql-uuid-converter', packagejs.repository.url.replace('git+',''));

                // Register post-app and post-entity hook
                try {
                    this.registerModule(
                        'generator-jhipster-mysql-uuid-converter',
                        'entity',
                        'post',
                        'entity',
                        'mysql Long to UUID converter'
                    );
                    this.log(
                        `${chalk.blue.bold('App!')} Registering complete...\n`
                    );
                } catch (err) {
                    this.log(
                        `${chalk.red.bold(
                            'WARN!'
                        )} Could not register as a jhipster post app and entity creation hook......\n`
                    );
                }
            }
        };
    }

    install() {
        if (this.abort) {
            return;
        }

        const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(
            `${this.clientPackageManager} install`
        )}`;

        // const injectDependenciesAndConstants = (err) => {
        //     if (err) {
        //         this.warning('Install of dependencies failed!');
        //         this.log(logMsg);
        //     } else if (this.clientFramework === 'angularX') {
        //         // this.spawnCommand(this.clientPackageManager, ['webpack:build']);
        //     }
        // };

        // const installConfig = {
        //     npm: this.clientPackageManager !== 'yarn',
        //     yarn: this.clientPackageManager === 'yarn',
        //     bower: false,
        //     callback: injectDependenciesAndConstants
        // };

        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            // this.installDependencies(installConfig);
        }

        this.log(`\n${chalk.bold.blue('App Install complete...')}`);
    }

    end() {
        this.log(
            `\n${chalk.bold.blue('End of mysql-uuid-converter generator')}`
        );
    }
};
