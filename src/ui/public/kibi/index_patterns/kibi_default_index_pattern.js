import { IndexPatternAuthorizationError, NoDefaultIndexPattern } from 'ui/errors';
import { IndexPatternsGetProvider } from 'ui/index_patterns/_get';
import { uiModules } from 'ui/modules';
import { map } from 'lodash';

function KibiDefaultIndexPatternProvider(Private, indexPatterns) {

  const getIds = Private(IndexPatternsGetProvider)('id');

  const _loadIndexPattern = function (patternIds, defaultId) {
    return indexPatterns.get(defaultId)
    // Everything ok it will return the pattern else
    .catch(err => {
      if (err instanceof IndexPatternAuthorizationError) {
        if (patternIds.length) {
          return _loadIndexPattern(patternIds, patternIds.pop());
        } else {
          // None of the known index patterns can be accessed
          throw new NoDefaultIndexPattern();
        }
      }
      throw err;
    });
  };

  class KibiDefaultIndexPattern {

    async getDefaultIndexPattern(defaultId) {

      return getIds().then(function (patternIds) {
        if (!defaultId && patternIds.length > 0) {
          defaultId = patternIds[0];
        }

        return _loadIndexPattern(patternIds, defaultId);
      });
    }

  }

  return new KibiDefaultIndexPattern();
}


uiModules
.get('kibana')
.service('kibiDefaultIndexPattern', (Private) => Private(KibiDefaultIndexPatternProvider));
