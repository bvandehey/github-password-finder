'use script';

const expect = require('chai').expect;
const rewire = require('rewire');
const contentTesters = rewire('../../lib/searchers/content_testers');
const fs = require('fs');

contentTesters.__set__({
    ALLOW_TEST_RESOURCES: true
});

function testFile(file) {
    const fileContent = fs.readFileSync(file).toString('utf8');
    const passwords = contentTesters
        .collectTesters(file)
        .map(tester => tester.test(fileContent))[0];
    return {
        andExpectToHaveFoundAPassword: () => {
            expect(passwords).to.be.an('array').that.is.not.empty;
            return {
                butItsOnlyForLocalhost: () => {
                    expect(passwords.excludeLocalPasswords()).that.is.empty;
                },
                andItsNotForLocalhost: () => {
                    expect(passwords.excludeLocalPasswords()).that.is.not.empty;
                }
            };
        },
        andExpectNotToHaveFoundAPassword: () => {
            expect(passwords).to.be.null;
        }
    };
}

describe('GIVEN a JS file', () => {

    it('WHEN the file does not mention anything about passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/js_file_without_mentioning_passwords.js')
            .andExpectNotToHaveFoundAPassword();
    });

    it('WHEN the file mentions something about passwords, but does not actually contain any passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/js_file_mentions_password_but_in_a_wrong_way.js')
            .andExpectNotToHaveFoundAPassword()
    });

    it( 'WHEN the file contains passwords with simple assignment, THEN the testers should find it', () => {
        testFile('test/resources/js_file_mentions_passwords.js')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords inside an object, THEN the testers should find it', () => {
        testFile('test/resources/js_file_mentions_passwords_in_object.js')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords, but only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/js_file_mentions_passwords_for_localhost.js')
            .andExpectToHaveFoundAPassword()
            .butItsOnlyForLocalhost();
    });

    it('WHEN the file contains passwords, not only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/js_file_mentions_passwords_not_for_localhost.js')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });
});

describe('GIVEN a JSON file', () => {

    it('WHEN the file does not mention anything about passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/json_file_without_mentioning_passwords.json')
            .andExpectNotToHaveFoundAPassword();
    });

    it( 'WHEN the file contains passwords, THEN the testers should find it', () => {
        testFile('test/resources/json_file_mentions_passwords.json')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords, but only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/json_file_mentions_passwords_for_localhost.json')
            .andExpectToHaveFoundAPassword()
            .butItsOnlyForLocalhost();
    });

    it('WHEN the file contains passwords, not only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/json_file_mentions_passwords_not_for_localhost.json')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });
});

describe('GIVEN a Java file', () => {

    it('WHEN the file does not mention anything about passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/java_file_without_mentioning_passwords.java')
            .andExpectNotToHaveFoundAPassword();
    });

    it('WHEN the file mentions something about passwords, but does not actually contain any passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/java_file_mentions_password_but_in_a_wrong_way.java')
            .andExpectNotToHaveFoundAPassword()
    });

    it( 'WHEN the file contains passwords with simple assignment, THEN the testers should find it', () => {
        testFile('test/resources/java_file_mentions_passwords.java')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords inside an object, THEN the testers should find it', () => {
        testFile('test/resources/java_file_mentions_passwords_in_object.java')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords, but only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/java_file_mentions_passwords_for_localhost.java')
            .andExpectToHaveFoundAPassword()
            .butItsOnlyForLocalhost();
    });

    it('WHEN the file contains passwords, not only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/java_file_mentions_passwords_not_for_localhost.java')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });
});

describe('GIVEN an XML file', () => {

    it('WHEN the file does not mention anything about passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/xml_file_without_mentioning_passwords.xml')
            .andExpectNotToHaveFoundAPassword();
    });

    it( 'WHEN the file contains passwords as tag value, THEN the testers should find it', () => {
        testFile('test/resources/xml_file_mentions_passwords_as_value.xml')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it( 'WHEN the file contains passwords as attribute, THEN the testers should find it', () => {
        testFile('test/resources/xml_file_mentions_passwords_as_attribute.xml')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords in tag values, but only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/xml_file_mentions_passwords_in_tags_for_localhost.xml')
            .andExpectToHaveFoundAPassword()
            .butItsOnlyForLocalhost();
    });

    it('WHEN the file contains passwords in attributes, but only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/xml_file_mentions_passwords_in_attributes_for_localhost.xml')
            .andExpectToHaveFoundAPassword()
            .butItsOnlyForLocalhost();
    });

    it('WHEN the file contains passwords, not only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/xml_file_mentions_passwords_in_tags_not_for_localhost.xml')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });
});

describe('GIVEN a properties file', () => {

    it('WHEN the file does not mention anything about passwords, THEN the testers should not find anything', () => {
        testFile('test/resources/props_file_without_mentioning_passwords.properties')
            .andExpectNotToHaveFoundAPassword();
    });

    it( 'WHEN the file contains passwords as tag value, THEN the testers should find it', () => {
        testFile('test/resources/props_file_mentions_passwords.properties')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });

    it('WHEN the file contains passwords, but only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/props_file_mentions_passwords_for_localhost.properties')
            .andExpectToHaveFoundAPassword()
            .butItsOnlyForLocalhost();
    });

    it('WHEN the file contains passwords, not only for localhost, THEN the testers should not find it', () => {
        testFile('test/resources/props_file_mentions_passwords_not_for_localhost.properties')
            .andExpectToHaveFoundAPassword()
            .andItsNotForLocalhost();
    });
});

describe('GIVEN all the detected false-positives in previous runs', () => {

    const noPasswordPath = 'test/resources/false_positives/no_password';
    const localhostsPath = 'test/resources/false_positives/for_localhosts'

    fs.readdirSync(noPasswordPath)
        .forEach(file => {
            const fullPath = `${noPasswordPath}/${file}`;

            it(`WHEN scanning ${fullPath}, THEN no passwords should be found`, () => {
                testFile(fullPath).andExpectNotToHaveFoundAPassword();
            });
        });

    fs.readdirSync(localhostsPath)
        .forEach(file => {
            const fullPath = `${localhostsPath}/${file}`;

            it(`WHEN scanning ${fullPath}, THEN only localhost passwords should be found`, () => {
                testFile(fullPath).andExpectToHaveFoundAPassword().butItsOnlyForLocalhost();
            });
        });
});